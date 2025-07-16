// commands/ai.js - AI Command module
const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { config } = require('../config');
const { logger } = require('../utils/logger');

const aiCommand = new Command('ai');

// AI Service Class
class AIService {
  constructor() {
    this.provider = config.get('ai.provider');
    this.apiKey = config.get('ai.apiKey');
    this.model = config.get('ai.model');
    this.temperature = config.get('ai.temperature');
    this.maxTokens = config.get('ai.maxTokens');
  }

  async initialize() {
    if (!this.apiKey) {
      const { apiKey } = await inquirer.prompt([
        {
          type: 'password',
          name: 'apiKey',
          message: 'Enter your AI API key:',
          mask: '*'
        }
      ]);
      config.set('ai.apiKey', apiKey);
      this.apiKey = apiKey;
    }

    if (this.provider === 'openai') {
      const { OpenAI } = require('openai');
      this.client = new OpenAI({ apiKey: this.apiKey });
    } else if (this.provider === 'anthropic') {
      const { Anthropic } = require('anthropic');
      this.client = new Anthropic({ apiKey: this.apiKey });
    }
  }

  async generateResponse(prompt, context = {}) {
    try {
      if (this.provider === 'openai') {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: context.system || 'You are a helpful AI assistant for developers.' },
            { role: 'user', content: prompt }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens
        });
        return response.choices[0].message.content;
      } else if (this.provider === 'anthropic') {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          system: context.system || 'You are a helpful AI assistant for developers.',
          messages: [{ role: 'user', content: prompt }]
        });
        return response.content[0].text;
      }
    } catch (error) {
      logger.error('AI API Error:', error.message);
      throw error;
    }
  }

  async generateCode(description, language = 'javascript') {
    const prompt = `Generate ${language} code for: ${description}
    
    Please provide:
    1. Clean, well-commented code
    2. Error handling
    3. Best practices
    4. Example usage if applicable
    
    Format the response as markdown with code blocks.`;

    const context = {
      system: `You are an expert ${language} developer. Generate high-quality, production-ready code with proper error handling and documentation.`
    };

    return await this.generateResponse(prompt, context);
  }

  async reviewCode(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(filePath, 'utf8');
    const language = path.extname(filePath).slice(1);

    const prompt = `Review this ${language} code and provide:
    1. Code quality assessment
    2. Potential bugs or issues
    3. Performance improvements
    4. Security concerns
    5. Best practices recommendations
    
    Code:
    \`\`\`${language}
    ${code}
    \`\`\``;

    const context = {
      system: 'You are a senior code reviewer. Provide detailed, constructive feedback on code quality, security, and best practices.'
    };

    return await this.generateResponse(prompt, context);
  }

  async explainCode(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(filePath, 'utf8');
    const language = path.extname(filePath).slice(1);

    const prompt = `Explain this ${language} code in detail:
    
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Please provide:
    1. Overall purpose and functionality
    2. Step-by-step breakdown
    3. Key concepts and patterns used
    4. Dependencies and imports explanation`;

    const context = {
      system: 'You are a technical educator. Explain code clearly and thoroughly for developers of all levels.'
    };

    return await this.generateResponse(prompt, context);
  }

  async generateTests(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(filePath, 'utf8');
    const language = path.extname(filePath).slice(1);

    const prompt = `Generate comprehensive unit tests for this ${language} code:
    
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Please provide:
    1. Test cases for all functions/methods
    2. Edge cases and error conditions
    3. Mock data where needed
    4. Test setup and teardown
    5. Use appropriate testing framework for ${language}`;

    const context = {
      system: 'You are a test automation expert. Generate thorough, maintainable tests that follow testing best practices.'
    };

    return await this.generateResponse(prompt, context);
  }

  async optimizeCode(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const code = fs.readFileSync(filePath, 'utf8');
    const language = path.extname(filePath).slice(1);

    const prompt = `Optimize this ${language} code for better performance:
    
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Please provide:
    1. Optimized version of the code
    2. Performance improvements made
    3. Memory usage optimizations
    4. Algorithm improvements
    5. Before/after comparison`;

    const context = {
      system: 'You are a performance optimization expert. Focus on improving code efficiency while maintaining readability and functionality.'
    };

    return await this.generateResponse(prompt, context);
  }
}

aiCommand
  .description('AI-powered development assistance')
  .option('-p, --provider <provider>', 'AI provider (openai|anthropic)', 'openai')
  .option('-m, --model <model>', 'AI model to use')
  .option('-t, --temperature <temp>', 'Temperature for AI responses', parseFloat);

// Chat with AI
aiCommand
  .command('chat')
  .description('Start an interactive chat with AI')
  .option('-c, --context <context>', 'Set context for the conversation')
  .action(async (options) => {
    const aiService = new AIService();
    const spinner = ora('Initializing AI service...').start();

    try {
      await aiService.initialize();
      spinner.succeed('AI service initialized');

      console.log(chalk.green('AI Chat Mode - Type "exit" to quit\n'));

      while (true) {
        const { message } = await inquirer.prompt([
          {
            type: 'input',
            name: 'message',
            message: 'You:'
          }
        ]);

        if (message.toLowerCase() === 'exit') {
          console.log(chalk.yellow('Goodbye!'));
          break;
        }

        const thinkingSpinner = ora('AI is thinking...').start();
        try {
          const response = await aiService.generateResponse(message, {
            system: options.context || 'You are a helpful AI assistant for developers.'
          });
          thinkingSpinner.succeed('AI:');
          console.log(chalk.blue(response) + '\n');
        } catch (error) {
          thinkingSpinner.fail('Error generating response');
          console.error(chalk.red(error.message));
        }
      }
    } catch (error) {
      spinner.fail('Failed to initialize AI service');
      console.error(chalk.red(error.message));
    }
  });

// Generate code
aiCommand
  .command('generate <description>')
  .description('Generate code from description')
  .option('-l, --language <lang>', 'Programming language', 'javascript')
  .option('-o, --output <file>', 'Output file')
  .action(async (description, options) => {
    const aiService = new AIService();
    const spinner = ora('Generating code...').start();

    try {
      await aiService.initialize();
      const code = await aiService.generateCode(description, options.language);
      spinner.succeed('Code generated successfully');

      if (options.output) {
        fs.writeFileSync(options.output, code);
        console.log(chalk.green(`Code saved to: ${options.output}`));
      } else {
        console.log('\n' + chalk.cyan('Generated Code:'));
        console.log(code);
      }
    } catch (error) {
      spinner.fail('Failed to generate code');
      console.error(chalk.red(error.message));
    }
  });

// Review code
aiCommand
  .command('review <file>')
  .description('Get AI code review')
  .option('-o, --output <file>', 'Save review to file')
  .action(async (file, options) => {
    const aiService = new AIService();
    const spinner = ora('Reviewing code...').start();

    try {
      await aiService.initialize();
      const review = await aiService.reviewCode(file);
      spinner.succeed('Code review completed');

      if (options.output) {
        fs.writeFileSync(options.output, review);
        console.log(chalk.green(`Review saved to: ${options.output}`));
      } else {
        console.log('\n' + chalk.cyan('Code Review:'));
        console.log(review);
      }
    } catch (error) {
      spinner.fail('Failed to review code');
      console.error(chalk.red(error.message));
    }
  });

// Explain code
aiCommand
  .command('explain <file>')
  .description('Get AI explanation of code')
  .action(async (file) => {
    const aiService = new AIService();
    const spinner = ora('Analyzing code...').start();

    try {
      await aiService.initialize();
      const explanation = await aiService.explainCode(file);
      spinner.succeed('Code analysis completed');

      console.log('\n' + chalk.cyan('Code Explanation:'));
      console.log(explanation);
    } catch (error) {
      spinner.fail('Failed to explain code');
      console.error(chalk.red(error.message));
    }
  });

// Generate tests
aiCommand
  .command('test <file>')
  .description('Generate tests for code file')
  .option('-o, --output <file>', 'Output test file')
  .action(async (file, options) => {
    const aiService = new AIService();
    const spinner = ora('Generating tests...').start();

    try {
      await aiService.initialize();
      const tests = await aiService.generateTests(file);
      spinner.succeed('Tests generated successfully');

      if (options.output) {
        fs.writeFileSync(options.output, tests);
        console.log(chalk.green(`Tests saved to: ${options.output}`));
      } else {
        console.log('\n' + chalk.cyan('Generated Tests:'));
        console.log(tests);
      }
    } catch (error) {
      spinner.fail('Failed to generate tests');
      console.error(chalk.red(error.message));
    }
  });

// Optimize code
aiCommand
  .command('optimize <file>')
  .description('Optimize code for better performance')
  .option('-o, --output <file>', 'Output optimized file')
  .action(async (file, options) => {
    const aiService = new AIService();
    const spinner = ora('Optimizing code...').start();

    try {
      await aiService.initialize();
      const optimized = await aiService.optimizeCode(file);
      spinner.succeed('Code optimization completed');

      if (options.output) {
        fs.writeFileSync(options.output, optimized);
        console.log(chalk.green(`Optimized code saved to: ${options.output}`));
      } else {
        console.log('\n' + chalk.cyan('Optimized Code:'));
        console.log(optimized);
      }
    } catch (error) {
      spinner.fail('Failed to optimize code');
      console.error(chalk.red(error.message));
    }
  });

// Configure AI settings
aiCommand
  .command('config')
  .description('Configure AI settings')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select AI provider:',
        choices: ['openai', 'anthropic'],
        default: config.get('ai.provider')
      },
      {
        type: 'input',
        name: 'model',
        message: 'Enter model name:',
        default: config.get('ai.model')
      },
      {
        type: 'number',
        name: 'temperature',
        message: 'Temperature (0.0-1.0):',
        default: config.get('ai.temperature'),
        validate: (value) => value >= 0 && value <= 1
      },
      {
        type: 'number',
        name: 'maxTokens',
        message: 'Max tokens:',
        default: config.get('ai.maxTokens')
      }
    ]);

    config.set('ai.provider', answers.provider);
    config.set('ai.model', answers.model);
    config.set('ai.temperature', answers.temperature);
    config.set('ai.maxTokens', answers.maxTokens);

    console.log(chalk.green('AI configuration updated successfully!'));
  });

module.exports = aiCommand;
