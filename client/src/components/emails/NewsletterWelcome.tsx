import React from 'react';

interface WelcomeEmailProps {
  subscriberName?: string;
  unsubscribeUrl: string;
}

export const NewsletterWelcomeEmail: React.FC<WelcomeEmailProps> = ({
  subscriberName = 'Subscriber',
  unsubscribeUrl
}) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: '#1f1e1d', color: 'white', padding: '20px', textAlign: 'center' }}>
        <h1>PristinePrimier Real Estate</h1>
      </div>
      
      <div style={{ background: '#f9f9f9', padding: '30px' }}>
        <h2>Welcome to Our Newsletter, {subscriberName}!</h2>
        <p>Thank you for joining the PristinePrimier Real Estate newsletter!</p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href="https://pristineprimier.com/properties" 
            style={{
              background: '#f77f77',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block'
            }}
          >
            Browse Properties
          </a>
        </div>
      </div>
      
      <div style={{ background: '#f77f77', color: 'white', padding: '20px', textAlign: 'center' }}>
        <p>
          <a href={unsubscribeUrl} style={{ color: 'white', textDecoration: 'underline' }}>
            Unsubscribe
          </a>
        </p>
      </div>
    </div>
  );
};

// Helper function to convert React component to HTML string
export const renderEmailToString = (unsubscribeUrl: string, subscriberName: string = 'Subscriber'): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to PristinePrimier Newsletter</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #f5f5f5;
        }
        .header { 
          background: #1f1e1d; 
          color: white; 
          padding: 20px; 
          text-align: center; 
        }
        .content { 
          background: #ffffff; 
          padding: 30px; 
          border-radius: 0 0 5px 5px;
        }
        .footer { 
          background: #f77f77; 
          color: white; 
          padding: 20px; 
          text-align: center; 
          border-radius: 0 0 5px 5px;
        }
        .button { 
          background: #f77f77; 
          color: white; 
          padding: 12px 30px; 
          text-decoration: none; 
          border-radius: 5px; 
          display: inline-block;
          font-weight: bold;
        }
        .button:hover {
          background: #e56a6a;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">PristinePrimier Real Estate</h1>
      </div>
      
      <div class="content">
        <h2 style="color: #1f1e1d; margin-top: 0;">Welcome to Our Newsletter, ${subscriberName}!</h2>
        <p style="font-size: 16px; color: #555;">Thank you for joining the PristinePrimier Real Estate newsletter! You'll now receive:</p>
        <ul style="color: #555; font-size: 14px;">
          <li>Exclusive property listings</li>
          <li>Market insights and trends</li>
          <li>Special offers and promotions</li>
          <li>Real estate investment tips</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://pristineprimier.com/properties" class="button">
            Browse Properties
          </a>
        </div>

        <p style="font-size: 14px; color: #777; text-align: center;">
          Stay tuned for our next update!
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0; font-size: 14px;">
          <a href="${unsubscribeUrl}" style="color: white; text-decoration: underline;">
            Unsubscribe from our newsletter
          </a>
        </p>
        <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
          PristinePrimier Real Estate &copy; ${new Date().getFullYear()}
        </p>
      </div>
    </body>
    </html>
  `;
};

// Optional: Export a function to generate the actual email content for backend use
export const generateWelcomeEmailContent = (unsubscribeUrl: string, subscriberName?: string) => {
  const subject = 'Welcome to PristinePrimier Real Estate Newsletter!';
  const htmlContent = renderEmailToString(unsubscribeUrl, subscriberName);
  const textContent = `
Welcome to PristinePrimier Real Estate Newsletter, ${subscriberName || 'Subscriber'}!

Thank you for joining our newsletter! You'll now receive:
- Exclusive property listings
- Market insights and trends  
- Special offers and promotions
- Real estate investment tips

Browse our properties: https://pristineprimier.com/properties

If you no longer wish to receive these emails, you can unsubscribe here:
${unsubscribeUrl}

Best regards,
The PristinePrimier Team

© ${new Date().getFullYear()} PristinePrimier Real Estate
  `.trim();

  return {
    subject,
    htmlContent,
    textContent
  };
};