import { config } from 'dotenv';
import { ModeratorAgent } from './agents/ModeratorAgent';
import { ExpertAgent } from './agents/ExpertAgent';
import { CriticAgent } from './agents/CriticAgent';

// Load environment variables
config();

/**
 * Test the agents with LLMService
 */
async function testAgents() {
  console.log('🧪 Testing Debate Agents with LLMService\n');
  console.log('='.repeat(50));

  try {
    // Test Moderator Agent
    console.log('\n📌 Testing Moderator Agent (Sophia)');
    const moderator = new ModeratorAgent();
    await moderator.initialize();

    const topic = "Should AI replace human developers in the next decade?";
    const modIntro = await moderator.introduceTopic(topic);
    console.log('✅ Moderator Introduction:', modIntro.content);
    console.log('-'.repeat(50));

    // Test Expert Agent
    console.log('\n📌 Testing Expert Agent (Dr. Alex Chen)');
    const expert = new ExpertAgent();
    await expert.initialize();

    const expertPosition = await expert.provideInitialPosition(topic, modIntro.content);
    console.log('✅ Expert Position:', expertPosition.content);
    console.log('-'.repeat(50));

    // Test Critic Agent
    console.log('\n📌 Testing Critic Agent (Jordan Rivers)');
    const critic = new CriticAgent();
    await critic.initialize();

    const criticChallenge = await critic.challengePosition(expertPosition.content, topic);
    console.log('✅ Critic Challenge:', criticChallenge.content);
    console.log('-'.repeat(50));

    // Test Expert Response
    console.log('\n📌 Testing Expert Response to Criticism');
    const context = `Topic: ${topic}\nExpert: ${expertPosition.content}\nCritic: ${criticChallenge.content}`;
    const expertDefense = await expert.respondToCriticism(criticChallenge.content, context);
    console.log('✅ Expert Defense:', expertDefense.content);
    console.log('-'.repeat(50));

    // Test Moderator Synthesis
    console.log('\n📌 Testing Moderator Synthesis');
    const roundMessages = [expertPosition, criticChallenge, expertDefense];
    const synthesis = await moderator.synthesizeRound(roundMessages);
    console.log('✅ Moderator Synthesis:', synthesis.content);
    console.log('-'.repeat(50));

    // Test Closing Statements
    console.log('\n📌 Testing Closing Statements');

    const expertClosing = await expert.provideClosingStatement(context);
    console.log('✅ Expert Closing:', expertClosing.content);

    const criticClosing = await critic.provideClosingStatement(context);
    console.log('✅ Critic Closing:', criticClosing.content);

    const allMessages = [...roundMessages, expertClosing, criticClosing];
    const conclusion = await moderator.concludeDebate(allMessages);
    console.log('✅ Moderator Conclusion:', conclusion.content);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All agent tests completed successfully!');

    // Check if we're using real LLM or fallback
    if (!process.env.GEMINI_API_KEY) {
      console.log('\n⚠️  Note: Running with fallback responses (no Gemini API key)');
      console.log('   Set GEMINI_API_KEY in .env to use real Gemini responses');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : '');
  }

  process.exit(0);
}

// Run the tests
console.log('Starting agent tests...\n');
testAgents();