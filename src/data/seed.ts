import type { Contact, ConnectedAccount, Conversation, Message } from '../types';

export const seedAccounts: ConnectedAccount[] = [
  { id: 'acc-email-support', channel: 'email', displayName: 'Support', identifier: 'support@acme.com', status: 'connected' },
  { id: 'acc-email-sales', channel: 'email', displayName: 'Sales', identifier: 'sales@acme.com', status: 'connected' },
  { id: 'acc-email-billing', channel: 'email', displayName: 'Billing', identifier: 'billing@acme.com', status: 'connected' },
  { id: 'acc-ig-india', channel: 'instagram', displayName: 'Acme India', identifier: '@acmeindia', status: 'connected' },
  { id: 'acc-ig-global', channel: 'instagram', displayName: 'Acme Global', identifier: '@acmeglobal', status: 'disconnected' },
  { id: 'acc-wa-primary', channel: 'whatsapp', displayName: 'Primary', identifier: '+91 98765 43210', status: 'connected' },
  { id: 'acc-wa-secondary', channel: 'whatsapp', displayName: 'Secondary', identifier: '+91 99887 66554', status: 'connected' },
];

// ─── 100 Contacts ───────────────────────────────────────────

const names = [
  'Rahul Sharma', 'Priya Mehta', 'Aman Verma', 'Neha Kapoor', 'Arjun Singh',
  'Karan Malhotra', 'Riya Gupta', 'Vikram Sethi', 'Ananya Rao', 'Dev Mehta',
  'Ishita Jain', 'Rohan Kapoor', 'Sneha Bansal', 'Aditya Khanna', 'Meera Shah',
  'Kabir Joshi', 'Tanya Dubey', 'Farhan Ali', 'Deepika Nair', 'Siddharth Rao',
  'Nisha Patel', 'Varun Chopra', 'Ankita Deshmukh', 'Raj Malhotra', 'Simran Kaur',
  'Vivek Sharma', 'Pooja Reddy', 'Nikhil Bansal', 'Shreya Pillai', 'Mohit Agarwal',
  'Tanvi Kulkarni', 'Gaurav Sinha', 'Payal Joshi', 'Ashish Tiwari', 'Nandini Menon',
  'Sahil Khan', 'Bhavya Nair', 'Karan Bajaj', 'Divya Saxena', 'Ravi Kumar',
  'Meghna Das', 'Adnan Shaikh', 'Pallavi Suresh', 'Abhishek Mishra', 'Isha Bhatia',
  'Manish Goel', 'Ritika Sharma', 'Suresh Pillai', 'Neeraj Gupta', 'Swati Kulkarni',
  'Dinesh Choudhary', 'Komal Singh', 'Tarun Bose', 'Priyanka Khandelwal', 'Alok Verma',
  'Sunita Pandey', 'Ajay Jaiswal', 'Rashmi Iyer', 'Sanjay Mehta', 'Nehal Thakur',
  'Prakash Nair', 'Monika Dasgupta', 'Deepak Chauhan', 'Aarti Shah', 'Rahul Dubey',
  'Pooja Bhatt', 'Imran Pathan', 'Shruti Chandra', 'Anil Kapoor', 'Geeta Devi',
  'Siddhi Patil', 'Harsh Vardhan', 'Madhuri Kulkarni', 'Vikas Jindal', 'Shilpa Rao',
  'Manoj Kumar', 'Sweta Singh', 'Akash Thakur', 'Kavita Menon', 'Naveen Reddy',
  'Priyanka Gupta', 'Rahul Bhardwaj', 'Sakshi Agarwal', 'Arun Prasad', 'Suman Jha',
  'Rohit Sinha', 'Nisha Aggarwal', 'Deepak Nambiar', 'Anjali Pillai', 'Sunil Yadav',
  'Preeti Sharma', 'Vishal Mehra', 'Sarojini Naidu', 'Kishore Kumar', 'Lakshmi Raman',
];

const domains = ['example.com', 'gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randPhone(): string { return '+91 ' + (9000000000 + Math.floor(Math.random() * 999999999)).toString().slice(0,5) + ' ' + (10000 + Math.floor(Math.random() * 89999)).toString(); }

const priorityPool: ('high' | 'normal' | 'normal' | 'normal' | 'normal')[] = ['high', 'normal', 'normal', 'normal', 'normal'];
const statusPool: ('open' | 'open' | 'open' | 'pending' | 'resolved')[] = ['open', 'open', 'open', 'pending', 'resolved'];
const assignedPool = ['You', 'You', 'You', 'Sarah', 'Aman', 'Ravi', ''];
const tagSets = [
  ['VIP', 'Subscription'], ['New customer'], ['Enterprise', 'VIP'], ['Subscription', 'Returning customer'],
  ['VIP', 'Enterprise'], ['New customer'], ['Subscription'], ['Returning customer'],
  ['Enterprise'], ['New customer'], ['Subscription', 'VIP'], ['Enterprise', 'Returning customer'],
];
const notes = [
  'Prefers WhatsApp for quick questions. Use email for invoices and longer-form responses.',
  'Key enterprise contact. Escalate any billing issues immediately.',
  'Long-time customer. Very particular about response times.',
  'Active on Instagram. Responds faster there than email.',
  'CTO of a major client. Needs technical escalation for any API issues.',
  'Calls frequently. Prefers phone support for urgent issues.',
  'Technical user. Share API docs when possible.',
  'New to the platform. Follow up within 24 hours.',
  'VIP customer — always prioritize their requests.',
  'Important enterprise account. Assign senior agent.',
];
const subjects = [
  'Billing inquiry', 'API integration help', 'Account access issue', 'Feature request',
  'Plan upgrade', 'Subscription renewal', 'Data export request', 'Bug report',
  'Enterprise pricing', 'Referral question', 'Webhook not working', 'Login issue',
  'Payment failed', 'Pro plan specs', 'Admin access request', 'Dashboard help',
  'Slack integration', 'SSO setup', 'Rate limit issue', 'Mobile app question',
];
const messageBodies = [
  'Hi team,\n\nI noticed some unusual charges on my account. Could you look into this?\n\nThanks',
  'Hello,\n\nI need to update our enterprise license. Can you send a revised quote?\n\nRegards',
  'Hi,\n\nI\'d like to know more about your pricing. Can you share the details?',
  'Hey, I\'m having trouble logging in. Getting a 403 error.',
  'Hi team,\n\nCan you help me with the API integration? I\'m getting rate limit errors.',
  'Hello,\n\nMy subscription renewal is coming up. I\'d like to discuss custom pricing.',
  'Hi,\n\nI accidentally subscribed to the wrong plan. Can you help me switch?',
  'Hey, do you offer student discounts?',
  'Hi,\n\nCan you send me the detailed specs for the Pro plan?',
  'Hello,\n\nWe need admin access for 3 new members. Can you process this?',
  'Hi team,\n\nOur webhook is not receiving events. Can you check the endpoint?',
  'Hey, I saw your latest post. Is the new feature available yet?',
  'Hi,\n\nI\'d like to upgrade from Pro to Enterprise. What additional features do I get?',
  'Hello,\n\nCan you help me set up the Slack integration?',
  'Hi,\n\nIs there a mobile app for this?',
  'Hey, I need the invoice for last month urgently.',
  'Hi team,\n\nI\'m experiencing a critical issue with the API. Please escalate immediately.',
  'Hello,\n\nCan you export all my data? Is there a bulk export feature?',
  'Hi,\n\nI want to cancel my subscription. The product isn\'t meeting my needs.',
  'Hey, do you have a referral program?',
];
const replyBodies = [
  'Hi,\n\nThank you for reaching out. I can look into this right away.\n\nBest regards',
  'Hi,\n\nAbsolutely. I\'ll check the billing history and get back to you shortly.\n\nBest,',
  'Hello,\n\nSure! I\'ve attached the detailed quote. Let me know if you have any questions.\n\nBest,',
  'Hi,\n\nWe\'ve reset your access. Please try logging in now.\n\nBest regards',
  'Hello,\n\nCould you share your API key prefix? We\'ll look into the rate limits for your tier.',
  'Hi,\n\nThanks for your interest! I\'ve attached our enterprise brochure and pricing guide.',
  'Hi,\n\nDone! You\'re now on the Pro plan. The difference has been credited to your account.',
  'Hello,\n\nYes! We offer 50% off for students. Please share your student ID.',
  'Hi,\n\nAttached are the full specs for the Pro plan.',
  'Hello,\n\nPlease share the email addresses and roles for the new members.',
  'Hi,\n\nI checked your webhook endpoint. Your server is blocking our requests.',
  'Hi,\n\nYes, it launched yesterday! You can sign up at acme.com/new.',
  'Hello,\n\nEnterprise includes unlimited seats, custom SSO, and a dedicated account manager.',
  'Hi,\n\nHere are the steps for Slack integration:\n1. Go to Settings → Integrations\n2. Click "Connect Slack"',
  'Yes! We have iOS and Android apps available on the App Store and Play Store.',
  'Sure, sending the invoice right away.',
  'Hi,\n\nI\'ve escalated this to our engineering team. They\'re investigating now.',
  'Hello,\n\nGo to Settings → Data → Export. You can export as CSV or JSON.',
  'Hi,\n\nSorry to hear that. Could you share what specific features you\'re missing?',
  'Yes! For every friend you refer, you both get 1 month free!',
];

export const seedContacts: Contact[] = names.map((name, i) => {
  const id = `c-${i + 1}`;
  const emailChannels = Math.random() > 0.3;
  const igChannels = Math.random() > 0.5;
  const waChannels = Math.random() > 0.3;
  return {
    id,
    name,
    email: emailChannels ? `${name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z.]/g, '')}@${pick(domains)}` : undefined,
    phone: waChannels ? randPhone() : undefined,
    instagramHandle: igChannels ? `@${name.toLowerCase().replace(/\s/g, '')}` : undefined,
    customerSince: `${pick(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])} 202${Math.floor(Math.random() * 5) + 1}`,
    tags: pick(tagSets),
    priority: pick(priorityPool),
    agentNote: Math.random() > 0.6 ? pick(notes) : undefined,
    lastPurchase: Math.random() > 0.5 ? `₹${(Math.floor(Math.random() * 50) + 1) * 999}` : undefined,
  };
});

// Build channel lists from contact data
function getChannels(c: Contact): ('email' | 'instagram' | 'whatsapp')[] {
  const ch: ('email' | 'instagram' | 'whatsapp')[] = [];
  if (c.email) ch.push('email');
  if (c.instagramHandle) ch.push('instagram');
  if (c.phone) ch.push('whatsapp');
  return ch;
}

function d(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600000).toISOString();
}

export const seedConversations: Conversation[] = seedContacts.map((c, i) => {
  const channels = getChannels(c);
  const status = pick(statusPool);
  const assigned = pick(assignedPool);
  const needsAttention = Math.random() > 0.85 ? pick(['reply_unavailable', 'message_failed', 'account_disconnected', 'unknown_contact'] as const) : undefined;
  return {
    id: `conv-${i + 1}`,
    contactId: c.id,
    status: status as any,
    unread: Math.random() > 0.45,
    priority: c.priority,
    assignedTo: i % 12 === 3 ? '' : (assigned || 'You'), // every 12th stays truly unassigned
    snoozed: i % 13 === 7, // guaranteed demo pool for the Snoozed view
    lastMessageAt: d(Math.floor(Math.random() * 168)), // up to 7 days
    channels,
    needsAttention,
  };
});

// Generate messages for each conversation (3-8 messages each)
const allMessages: Message[] = [];
let msgId = 1;

seedConversations.forEach((conv, convIdx) => {
  const contact = seedContacts[convIdx];
  const numMsgs = 3 + Math.floor(Math.random() * 6); // 3-8 messages
  const convChannels = conv.channels;

  for (let j = 0; j < numMsgs; j++) {
    const channel = pick(convChannels);
    const direction = j % 2 === 0 ? 'incoming' as const : 'outgoing' as const;
    const hoursAgo = numMsgs * 3 - j * 3 + Math.random() * 2;

    let accountId: string;
    let senderName: string;
    let senderIdentifier: string;

    if (direction === 'incoming') {
      senderName = contact.name;
      if (channel === 'email') { senderIdentifier = contact.email || 'unknown@email.com'; accountId = 'acc-email-support'; }
      else if (channel === 'instagram') { senderIdentifier = contact.instagramHandle || '@unknown'; accountId = 'acc-ig-india'; }
      else { senderIdentifier = contact.phone || '+91 00000 00000'; accountId = 'acc-wa-primary'; }
    } else {
      if (channel === 'email') { senderName = 'Support Agent'; senderIdentifier = 'support@acme.com'; accountId = 'acc-email-support'; }
      else if (channel === 'instagram') { senderName = 'Acme India'; senderIdentifier = '@acmeindia'; accountId = 'acc-ig-india'; }
      else { senderName = 'Acme Primary'; senderIdentifier = '+91 98765 43210'; accountId = 'acc-wa-primary'; }
    }

    const body = direction === 'incoming' ? pick(messageBodies) : pick(replyBodies);
    const metadata: any = {};
    if (channel === 'email') {
      metadata.subject = pick(subjects);
      metadata.from = direction === 'incoming' ? senderIdentifier : senderIdentifier;
      metadata.to = [direction === 'incoming' ? 'support@acme.com' : contact.email];
    } else if (channel === 'instagram') {
      metadata.handle = senderIdentifier;
      metadata.profileName = direction === 'incoming' ? contact.name : 'Acme India';
      if (Math.random() > 0.9) metadata.storyReply = true;
    } else {
      metadata.phoneNumber = senderIdentifier;
      metadata.deliveryStatus = pick(['delivered', 'read', 'delivered']);
    }

    const msg: Message = {
      id: `msg-${msgId++}`,
      conversationId: conv.id,
      channel,
      direction,
      senderName,
      senderIdentifier,
      connectedAccountId: accountId,
      timestamp: d(hoursAgo),
      body,
      ...(direction === 'outgoing' ? { status: pick(['read', 'delivered', 'sent'] as const) } : {}),
      metadata,
      ...(Math.random() > 0.85 ? [{ id: `att-${msgId}`, name: pick(['Invoice_August.pdf', 'Brochure_2025.pdf', 'Pro_Specs.pdf', 'Pricing_Guide.pdf', 'Report_Q3.pdf']), type: 'file' as const, size: pick(['380 KB', '1.2 MB', '890 KB', '2.4 MB', '420 KB']) }] : []),
    };

    allMessages.push(msg);
  }
});

// Add specific rich messages for Rahul Sharma (c-1) to ensure multi-channel timeline
const rahulExtra: Message[] = [
  { id: 'msg-r1', conversationId: 'conv-1', channel: 'email', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: 'rahul.sharma@example.com', connectedAccountId: 'acc-email-support', timestamp: d(120), body: 'Hi team,\n\nI noticed some unusual charges on my account last month. Could you look into this?\n\nThanks,\nRahul', metadata: { subject: 'Billing inquiry', from: 'rahul.sharma@example.com', to: ['support@acme.com'] } },
  { id: 'msg-r2', conversationId: 'conv-1', channel: 'email', direction: 'outgoing', senderName: 'Support Agent', senderIdentifier: 'support@acme.com', connectedAccountId: 'acc-email-support', timestamp: d(118), body: 'Hi Rahul,\n\nThank you for reaching out. I can see two charges — one was a renewal and the other a processing error.\n\nI\'ve initiated a refund for the duplicate charge. You should see it within 3-5 business days.\n\nBest regards,\nAcme Support', status: 'read', metadata: { subject: 'Re: Billing inquiry', from: 'support@acme.com', to: ['rahul.sharma@example.com'] } },
  { id: 'msg-r3', conversationId: 'conv-1', channel: 'email', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: 'rahul.sharma@example.com', connectedAccountId: 'acc-email-support', timestamp: d(116), body: 'That\'s great, thanks! One more thing — can you send me an updated invoice showing the refund?', metadata: { subject: 'Re: Billing inquiry', from: 'rahul.sharma@example.com', to: ['support@acme.com'] } },
  { id: 'msg-r4', conversationId: 'conv-1', channel: 'email', direction: 'outgoing', senderName: 'Sales Team', senderIdentifier: 'sales@acme.com', connectedAccountId: 'acc-email-sales', timestamp: d(115), body: 'Absolutely! I\'ll have the updated invoice sent to you by end of day.\n\nBest,\nAcme Sales', status: 'delivered', metadata: { subject: 'Re: Billing inquiry', from: 'sales@acme.com', to: ['rahul.sharma@example.com'] }, attachments: [{ id: 'att-r1', name: 'Invoice_August_Corrected.pdf', type: 'file', size: '380 KB' }] },
  { id: 'msg-r5', conversationId: 'conv-1', channel: 'email', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: 'rahul.sharma@example.com', connectedAccountId: 'acc-email-support', timestamp: d(72), body: 'Hi team,\n\nI had a question about my current subscription. I think I may have been charged twice this month.\n\nThanks,\nRahul', metadata: { subject: 'Subscription question', from: 'rahul.sharma@example.com', to: ['support@acme.com'], cc: ['accounts@acme.com'] } },
  { id: 'msg-r6', conversationId: 'conv-1', channel: 'email', direction: 'outgoing', senderName: 'Support Agent', senderIdentifier: 'support@acme.com', connectedAccountId: 'acc-email-support', timestamp: d(71), body: 'Hi Rahul,\n\nAbsolutely. I\'ll check the billing history and get back to you shortly.\n\nBest regards,\nAcme Support', status: 'read', metadata: { subject: 'Re: Subscription question', from: 'support@acme.com', to: ['rahul.sharma@example.com'] } },
  { id: 'msg-r7', conversationId: 'conv-1', channel: 'instagram', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '@rahulsharma', connectedAccountId: 'acc-ig-india', timestamp: d(36), body: 'Hey! Quick question about the new features you announced.', metadata: { handle: '@rahulsharma', profileName: 'Rahul Sharma' } },
  { id: 'msg-r8', conversationId: 'conv-1', channel: 'instagram', direction: 'outgoing', senderName: 'Acme India', senderIdentifier: '@acmeindia', connectedAccountId: 'acc-ig-india', timestamp: d(35), body: 'Hi Rahul! Sure, what would you like to know?', status: 'read', metadata: { handle: '@acmeindia', profileName: 'Acme India' } },
  { id: 'msg-r9', conversationId: 'conv-1', channel: 'instagram', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '@rahulsharma', connectedAccountId: 'acc-ig-india', timestamp: d(34), body: 'Does the new analytics dashboard support custom date ranges?', metadata: { handle: '@rahulsharma', profileName: 'Rahul Sharma' } },
  { id: 'msg-r10', conversationId: 'conv-1', channel: 'instagram', direction: 'outgoing', senderName: 'Acme India', senderIdentifier: '@acmeindia', connectedAccountId: 'acc-ig-india', timestamp: d(33), body: 'Yes! You can select any custom date range. We also added weekly and monthly presets.', status: 'read', metadata: { handle: '@acmeindia', profileName: 'Acme India' } },
  { id: 'msg-r11', conversationId: 'conv-1', channel: 'instagram', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '@rahulsharma', connectedAccountId: 'acc-ig-india', timestamp: d(24), body: 'Where was this photo taken?', metadata: { handle: '@rahulsharma', profileName: 'Rahul Sharma', storyReply: true } },
  { id: 'msg-r12', conversationId: 'conv-1', channel: 'instagram', direction: 'outgoing', senderName: 'Acme India', senderIdentifier: '@acmeindia', connectedAccountId: 'acc-ig-india', timestamp: d(23), body: 'This was from our Goa offsite 😄', status: 'read', metadata: { handle: '@acmeindia', profileName: 'Acme India' } },
  { id: 'msg-r13', conversationId: 'conv-1', channel: 'instagram', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '@rahulsharma', connectedAccountId: 'acc-ig-india', timestamp: d(20), body: 'Looks amazing!', metadata: { handle: '@rahulsharma', profileName: 'Rahul Sharma' } },
  { id: 'msg-r14', conversationId: 'conv-1', channel: 'instagram', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '@rahulsharma', connectedAccountId: 'acc-ig-india', timestamp: d(10), body: 'Also, I saw you have a referral program now. How does it work?', metadata: { handle: '@rahulsharma', profileName: 'Rahul Sharma' } },
  { id: 'msg-r15', conversationId: 'conv-1', channel: 'instagram', direction: 'outgoing', senderName: 'Acme India', senderIdentifier: '@acmeindia', connectedAccountId: 'acc-ig-india', timestamp: d(9), body: 'For every friend you refer who signs up, you both get 1 month free! I can send you a referral link via email.', status: 'delivered', metadata: { handle: '@acmeindia', profileName: 'Acme India' } },
  { id: 'msg-r16', conversationId: 'conv-1', channel: 'whatsapp', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(6), body: 'Hi, I need the invoice for last month urgently.', metadata: { phoneNumber: '+91 98765 43210' } },
  { id: 'msg-r17', conversationId: 'conv-1', channel: 'whatsapp', direction: 'outgoing', senderName: 'Acme Primary', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(5.5), body: 'Sure, Rahul. Sending it right away.', status: 'delivered', metadata: { phoneNumber: '+91 98765 43210', deliveryStatus: 'delivered' }, attachments: [{ id: 'att-r2', name: 'Invoice_July_2025.pdf', type: 'file', size: '420 KB' }] },
  { id: 'msg-r18', conversationId: 'conv-1', channel: 'whatsapp', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(4), body: 'Got it, thanks! Can you also send me the invoice for June?', metadata: { phoneNumber: '+91 98765 43210' } },
  { id: 'msg-r19', conversationId: 'conv-1', channel: 'whatsapp', direction: 'outgoing', senderName: 'Acme Primary', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(3), body: 'I already sent July. Let me check June for you.', status: 'delivered', metadata: { phoneNumber: '+91 98765 43210', deliveryStatus: 'delivered' } },
  { id: 'msg-r20', conversationId: 'conv-1', channel: 'whatsapp', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(2), body: 'Yes, June please!', metadata: { phoneNumber: '+91 98765 43210' } },
  { id: 'msg-r21', conversationId: 'conv-1', channel: 'whatsapp', direction: 'outgoing', senderName: 'Acme Primary', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(1), body: 'Here you go! Invoice for June attached.', status: 'delivered', metadata: { phoneNumber: '+91 98765 43210', deliveryStatus: 'read' }, attachments: [{ id: 'att-r3', name: 'Invoice_June_2025.pdf', type: 'file', size: '410 KB' }] },
  { id: 'msg-r22', conversationId: 'conv-1', channel: 'whatsapp', direction: 'incoming', senderName: 'Rahul Sharma', senderIdentifier: '+91 98765 43210', connectedAccountId: 'acc-wa-primary', timestamp: d(0.5), body: 'Perfect, thanks for the quick help! 🙏', metadata: { phoneNumber: '+91 98765 43210' } },
];

// Remove auto-generated conv-1 messages and add the rich ones
export const seedMessages: Message[] = [
  ...allMessages.filter(m => m.conversationId !== 'conv-1'),
  ...rahulExtra,
];
