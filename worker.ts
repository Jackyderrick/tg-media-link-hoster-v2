// 环境变量配置（在CF Workers控制台设置）
interface Env {
  BOT_TOKEN: string;
  ALLOWED_GROUP_IDS: string; // 逗号分隔的群组ID
  D1_DB: D1Database; // Cloudflare D1数据库绑定
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 解析Telegram Webhook请求
    const url = new URL(request.url);
    if (url.pathname === `/webhook/${env.BOT_TOKEN}`) {
      return handleTelegramWebhook(request, env);
    }
    
    // 处理媒体链接访问（如通过链接还原媒体）
    if (url.pathname.startsWith('/get/')) {
      return handleMediaRetrieval(url, env);
    }
    
    return new Response('Not found', { status: 404 });
  },
};

// 处理Telegram消息回调
async function handleTelegramWebhook(request: Request, env: Env) {
  const update = await request.json();
  const message = update.message;
  
  // 1. 群组权限校验（恢复原功能）
  const isAllowed = await checkGroupPermission(message, env.ALLOWED_GROUP_IDS);
  if (!isAllowed) {
    return await sendTelegramMessage(
      env.BOT_TOKEN,
      message.chat.id,
      "抱歉，本机器人仅对指定群组开放使用"
    );
  }
  
  // 2. 处理媒体文件（如图片、视频）
  if (message.media) {
    return await handleMediaUpload(message, env);
  }
  
  // 3. 处理链接（如通过代码获取媒体）
  if (message.text?.startsWith('/get ')) {
    return await handleMediaRequest(message, env);
  }
  
  return new Response('OK');
}

// 群组权限校验逻辑
async function checkGroupPermission(message: any, allowedGroupIds: string): Promise<boolean> {
  const chatType = message.chat.type;
  
  // 私人聊天始终允许
  if (chatType === 'private') return true;
  
  // 群组/超级群组需在允许列表中
  if (chatType === 'group' || chatType === 'supergroup') {
    const allowedIds = allowedGroupIds.split(',').map(id => id.trim());
    return allowedIds.includes(message.chat.id.toString());
  }
  
  // 其他类型（如频道）默认拒绝
  return false;
}

// 工具函数：调用Telegram Bot API发送消息
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// 处理媒体上传（简化示例）
async function handleMediaUpload(message: any, env: Env) {
  // 1. 获取媒体文件ID（如照片、视频）
  const mediaId = message.photo?.pop()?.file_id || message.video?.file_id;
  if (!mediaId) {
    return sendTelegramMessage(env.BOT_TOKEN, message.chat.id, "不支持的媒体类型");
  }
  
  // 2. 生成唯一访问码
  const accessCode = crypto.randomUUID().slice(0, 8);
  
  // 3. 存储媒体ID与访问码的映射（使用Cloudflare D1）
  await env.D1_DB.prepare(`
    INSERT INTO media_records (access_code, media_id, chat_id, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(accessCode, mediaId, message.chat.id).run();
  
  // 4. 回复用户访问链接
  return sendTelegramMessage(
    env.BOT_TOKEN,
    message.chat.id,
    `您的媒体链接：https://your-worker-domain.workers.dev/get/${accessCode}`
  );
}

// 处理媒体访问请求（通过链接还原）
async function handleMediaRetrieval(url: URL, env: Env) {
  const accessCode = url.pathname.split('/')[2];
  
  // 1. 从数据库查询媒体ID
  const { results } = await env.D1_DB.prepare(
    'SELECT media_id FROM media_records WHERE access_code = ?'
  ).bind(accessCode).all();
  
  if (results.length === 0) {
    return new Response('链接不存在或已过期', { status: 404 });
  }
  
  // 2. 调用Telegram API获取媒体文件URL
  const mediaId = results[0].media_id;
  const fileResp = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/getFile?file_id=${mediaId}`);
  const fileData = await fileResp.json();
  const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${fileData.result.file_path}`;
  
  // 3. 重定向到媒体文件
  return Response.redirect(fileUrl, 302);
}
    