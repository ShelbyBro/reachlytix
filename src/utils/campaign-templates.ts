
interface CampaignTemplate {
  id: string;
  name: string;
  type: "email" | "sms" | "whatsapp";
  category: "welcome" | "promotional" | "support";
  subject?: string;
  content: string;
}

export const campaignTemplates: CampaignTemplate[] = [
  // Email Templates
  {
    id: "email-welcome",
    name: "Welcome Email",
    type: "email",
    category: "welcome",
    subject: "Welcome to Our Community! 👋",
    content: `Dear {name},

We're thrilled to welcome you to our community! Thank you for choosing us as your trusted partner.

Here's what you can expect:
• Exclusive updates and offers
• Personalized service
• Expert support when you need it

If you have any questions, we're here to help!

Best regards,
{company_name}`
  },
  {
    id: "email-promo",
    name: "Special Offer",
    type: "email",
    category: "promotional",
    subject: "Special Offer Inside! 🎉",
    content: `Hello {name},

Don't miss out on our exclusive offer just for you!

🌟 Special Offer: {offer_details}
📅 Valid until: {end_date}

Click here to claim your offer today!

Best regards,
{company_name}`
  },
  {
    id: "email-feedback",
    name: "Feedback Request",
    type: "email",
    category: "support",
    subject: "We'd Love Your Feedback! ⭐",
    content: `Hi {name},

We hope you're enjoying our services! We'd love to hear your thoughts on your recent experience with us.

Could you take a moment to share your feedback? It helps us serve you better.

Thank you for being a valued customer!

Best regards,
{company_name}`
  },
  // SMS Templates
  {
    id: "sms-welcome",
    name: "Welcome SMS",
    type: "sms",
    category: "welcome",
    content: "Welcome to {company_name}! We're excited to have you join us. Reply HELP for assistance or visit our website for more info. Thank you!"
  },
  {
    id: "sms-promo",
    name: "Promotion SMS",
    type: "sms",
    category: "promotional",
    content: "{company_name}: Special offer! Get {discount}% off your next purchase with code {code}. Valid until {end_date}. T&Cs apply."
  },
  {
    id: "sms-reminder",
    name: "Reminder SMS",
    type: "sms",
    category: "support",
    content: "Hi from {company_name}! Just a reminder about your upcoming appointment on {date}. Reply YES to confirm or call us to reschedule."
  },
  // WhatsApp Templates
  {
    id: "whatsapp-welcome",
    name: "Welcome Message",
    type: "whatsapp",
    category: "welcome",
    content: `👋 Welcome to {company_name}!

We're excited to have you with us! 🎉

Feel free to reach out if you need any assistance. We're here to help! 🤝

Save our number for quick access to support and updates. 📱`
  },
  {
    id: "whatsapp-promo",
    name: "Promotional Offer",
    type: "whatsapp",
    category: "promotional",
    content: `🎯 Special Offer Alert!

Hi {name}! 

We have an exclusive offer for you:
🎁 {offer_details}
⏰ Valid until: {end_date}

Click the link to claim: {link}

Reply "INFO" for more details!`
  },
  {
    id: "whatsapp-support",
    name: "Support Message",
    type: "whatsapp",
    category: "support",
    content: `👋 Hello {name}!

How was your experience with {company_name}? 

We'd love to hear your feedback! 🌟

Need support? Our team is here to help 24/7! 
Reply with:
1️⃣ for Product Support
2️⃣ for Billing
3️⃣ for General Inquiries`
  }
];
