import { TriProtocolSDK } from 'tri-protocol/sdk/src';
import { AssistantAgentTemplate, ResearchAgentTemplate } from 'tri-protocol/sdk/src/templates/agents';

async function useTemplate() {
  console.log('📋 Using Pre-built Templates with Tri-Protocol SDK\n');
  console.log('===================================================\n');

  try {
    // Initialize SDK
    const sdk = await TriProtocolSDK.initialize({
      environment: 'development',
      debug: true
    });

    console.log('✅ SDK initialized successfully\n');

    // List available templates
    console.log('📋 Available Templates:');
    console.log('  - ChatAgentTemplate');
    console.log('  - ResearchAgentTemplate');
    console.log('  - AnalystAgentTemplate');
    console.log('  - AssistantAgentTemplate');
    console.log('  - DataPipelineTemplate');
    console.log('  - RAGPipelineTemplate');
    console.log('  - MultiAgentChatTemplate');
    console.log('\n');

    // Example 1: Smart Assistant using createAgent
    console.log('🤖 Example 1: Creating Smart Assistant...');
    const assistantBuilder = await sdk.createAgent('SmartAssistant');
    const assistant = await assistantBuilder
      .withCapability('conversation')
      .withCapability('reasoning')
      .withMemory('both')
      .build();

    console.log('Testing Smart Assistant:');
    const assistantResponse = await assistant.respond('What can you help me with?');
    console.log('Assistant:', assistantResponse);
    console.log('\n-----------------------------------\n');

    // Example 2: Research Agent Template
    console.log('🔬 Example 2: Creating Research Agent from template...');
    const researchAgent = new ResearchAgentTemplate(sdk);
    const researcher = await researchAgent.build({
      name: 'ResearchBot',
      topics: ['AI', 'Machine Learning', 'Multi-Agent Systems']
    });

    console.log('Testing Research Agent:');
    const researchResponse = await researcher.research('What are the latest trends in multi-agent systems?');
    console.log('Research Result:', researchResponse);
    console.log('\n-----------------------------------\n');

    // Example 3: Assistant Agent Template
    console.log('🎯 Example 3: Creating General Assistant from template...');
    const assistantTemplate = new AssistantAgentTemplate(sdk);
    const generalAssistant = await assistantTemplate.build({
      name: 'HelperBot',
      personality: 'friendly and professional'
    });

    console.log('Testing General Assistant:');
    const messages = [
      'Can you explain what Tri-Protocol is?',
      'How does it combine A2A, MCP, and LangGraph?'
    ];

    for (const msg of messages) {
      console.log(`User: ${msg}`);
      const response = await generalAssistant.assist(msg);
      console.log(`HelperBot: ${response}`);
      console.log('---');
    }

    // Example 4: Multi-Agent Workflow
    console.log('\n💬 Example 4: Creating Multi-Agent Workflow...');

    console.log('Creating workflow with multiple agents...');
    const workflowBuilder = await sdk.createWorkflow('MultiAgentDiscussion');

    // Create agents for the workflow
    const moderatorBuilder = await sdk.createAgent('Moderator');
    const moderator = await moderatorBuilder
      .withCapability('facilitation')
      .withSystemPrompt('You facilitate discussions between agents')
      .build();

    const expertBuilder = await sdk.createAgent('Expert');
    const expert = await expertBuilder
      .withCapability('analysis')
      .withSystemPrompt('You provide technical insights')
      .build();

    console.log('Multi-agent workflow configured successfully');

    console.log('\n✅ All template demos completed successfully!\n');

  } catch (error) {
    console.error('❌ Error using templates:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the template demo
useTemplate().catch(console.error);