import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Configuration
const CONFIG = {
  DISCORD_TOKEN: process.env.DISCORD_BOT_TOKEN,
  CHANNEL_ID: process.env.DISCORD_CHANNEL_ID,
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001',
  SCRAPE_INTERVAL: '0 9 * * *', // Daily at 9 AM
  MAX_CERTIFICATES_PER_POST: 5
};

// Certificate sources to scrape
const CERTIFICATE_SOURCES = [
  {
    name: 'Coursera',
    url: 'https://www.coursera.org/courses?query=free%20certificate',
    selector: '.cds-CommonCard-container',
    parser: parseCoursera
  },
  {
    name: 'edX',
    url: 'https://www.edx.org/search?q=free%20certificate',
    selector: '.discovery-card',
    parser: parseEdX
  },
  {
    name: 'FutureLearn',
    url: 'https://www.futurelearn.com/courses?filter_availability=started&filter_course_type=free',
    selector: '.m-card',
    parser: parseFutureLearn
  }
];

// Parsers for different platforms
function parseCoursera($, element) {
  try {
    const title = $(element).find('h3').text().trim();
    const provider = $(element).find('.partner-name').text().trim();
    const description = $(element).find('.course-description').text().trim();
    const url = 'https://coursera.org' + $(element).find('a').attr('href');
    
    return {
      title,
      provider: provider || 'Coursera',
      description: description.substring(0, 200) + '...',
      url,
      category: 'Technology',
      level: 'Beginner',
      duration: 'Self-paced',
      rating: 4.5,
      tags: ['Online Learning', 'Certificate']
    };
  } catch (error) {
    console.error('Error parsing Coursera course:', error);
    return null;
  }
}

function parseEdX($, element) {
  try {
    const title = $(element).find('h3').text().trim();
    const provider = $(element).find('.university').text().trim();
    const description = $(element).find('.course-description').text().trim();
    const url = 'https://edx.org' + $(element).find('a').attr('href');
    
    return {
      title,
      provider: provider || 'edX',
      description: description.substring(0, 200) + '...',
      url,
      category: 'Education',
      level: 'Intermediate',
      duration: 'Self-paced',
      rating: 4.3,
      tags: ['University', 'Certificate']
    };
  } catch (error) {
    console.error('Error parsing edX course:', error);
    return null;
  }
}

function parseFutureLearn($, element) {
  try {
    const title = $(element).find('h3').text().trim();
    const provider = $(element).find('.university-name').text().trim();
    const description = $(element).find('.course-summary').text().trim();
    const url = 'https://futurelearn.com' + $(element).find('a').attr('href');
    
    return {
      title,
      provider: provider || 'FutureLearn',
      description: description.substring(0, 200) + '...',
      url,
      category: 'Professional Development',
      level: 'Beginner',
      duration: 'Self-paced',
      rating: 4.2,
      tags: ['Professional', 'Certificate']
    };
  } catch (error) {
    console.error('Error parsing FutureLearn course:', error);
    return null;
  }
}

// Scrape certificates from a source
async function scrapeCertificates(source) {
  try {
    console.log(`Scraping certificates from ${source.name}...`);
    
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const certificates = [];

    $(source.selector).each((index, element) => {
      if (index >= 10) return false; // Limit to 10 per source
      
      const certificate = source.parser($, element);
      if (certificate && certificate.title && certificate.url) {
        certificates.push({
          ...certificate,
          id: `${source.name.toLowerCase()}-${Date.now()}-${index}`,
          addedDate: new Date().toISOString(),
          source: source.name
        });
      }
    });

    console.log(`Found ${certificates.length} certificates from ${source.name}`);
    return certificates;
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error.message);
    return [];
  }
}

// Scrape all sources
async function scrapeAllSources() {
  console.log('Starting certificate scraping...');
  
  const allCertificates = [];
  
  for (const source of CERTIFICATE_SOURCES) {
    try {
      const certificates = await scrapeCertificates(source);
      allCertificates.push(...certificates);
      
      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
    }
  }

  // Remove duplicates based on title
  const uniqueCertificates = allCertificates.filter((cert, index, self) =>
    index === self.findIndex(c => c.title === cert.title)
  );

  console.log(`Total unique certificates found: ${uniqueCertificates.length}`);
  return uniqueCertificates;
}

// Create Discord embed for certificates
function createCertificateEmbed(certificates) {
  const embed = new EmbedBuilder()
    .setTitle('🎓 New Free Certificates Available!')
    .setDescription('Here are some free certification opportunities we found today:')
    .setColor(0x3B82F6)
    .setTimestamp()
    .setFooter({ text: 'EduCert Bot • Updated daily' });

  certificates.slice(0, CONFIG.MAX_CERTIFICATES_PER_POST).forEach((cert, index) => {
    embed.addFields({
      name: `${index + 1}. ${cert.title}`,
      value: `**Provider:** ${cert.provider}\n**Level:** ${cert.level}\n**Duration:** ${cert.duration}\n[Start Course](${cert.url})`,
      inline: false
    });
  });

  if (certificates.length > CONFIG.MAX_CERTIFICATES_PER_POST) {
    embed.addFields({
      name: 'More Certificates',
      value: `And ${certificates.length - CONFIG.MAX_CERTIFICATES_PER_POST} more! Check our website for the complete list.`,
      inline: false
    });
  }

  return embed;
}

// Post certificates to Discord
async function postCertificatesToDiscord(certificates) {
  try {
    if (certificates.length === 0) {
      console.log('No new certificates to post');
      return;
    }

    const channel = await client.channels.fetch(CONFIG.CHANNEL_ID);
    if (!channel) {
      console.error('Discord channel not found');
      return;
    }

    const embed = createCertificateEmbed(certificates);
    await channel.send({ embeds: [embed] });

    console.log(`Posted ${certificates.length} certificates to Discord`);
  } catch (error) {
    console.error('Error posting to Discord:', error);
  }
}

// Send certificates to API
async function sendCertificatesToAPI(certificates) {
  try {
    if (certificates.length === 0) return;

    const response = await axios.post(`${CONFIG.API_BASE_URL}/api/discord/webhook`, {
      certificates
    });

    console.log(`Sent ${certificates.length} certificates to API`);
  } catch (error) {
    console.error('Error sending certificates to API:', error);
  }
}

// Main scraping function
async function performDailyScrape() {
  try {
    console.log('Starting daily certificate scrape...');
    
    const certificates = await scrapeAllSources();
    
    if (certificates.length > 0) {
      // Post to Discord
      await postCertificatesToDiscord(certificates);
      
      // Send to API
      await sendCertificatesToAPI(certificates);
      
      console.log('Daily scrape completed successfully');
    } else {
      console.log('No certificates found during scrape');
    }
  } catch (error) {
    console.error('Error during daily scrape:', error);
  }
}

// Bot event handlers
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
  console.log(`Monitoring channel: ${CONFIG.CHANNEL_ID}`);
  console.log(`Scrape schedule: ${CONFIG.SCRAPE_INTERVAL}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Manual scrape command
  if (message.content === '!scrape') {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You need administrator permissions to use this command.');
    }

    message.reply('Starting manual certificate scrape...');
    await performDailyScrape();
  }

  // Help command
  if (message.content === '!help') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('EduCert Bot Commands')
      .setDescription('Available commands for the EduCert bot')
      .setColor(0x3B82F6)
      .addFields(
        { name: '!scrape', value: 'Manually trigger certificate scraping (Admin only)', inline: false },
        { name: '!help', value: 'Show this help message', inline: false }
      )
      .setFooter({ text: 'EduCert Bot • Automated certificate discovery' });

    message.reply({ embeds: [helpEmbed] });
  }
});

// Schedule daily scraping
cron.schedule(CONFIG.SCRAPE_INTERVAL, () => {
  console.log('Scheduled scrape triggered');
  performDailyScrape();
});

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Start the bot
if (CONFIG.DISCORD_TOKEN) {
  client.login(CONFIG.DISCORD_TOKEN);
} else {
  console.error('DISCORD_BOT_TOKEN not found in environment variables');
  console.log('Please set up your Discord bot token in the .env file');
}