import { App } from '@/app';
import { initializeOpenAI } from './utils/initializeOpenAI';
import { SubmissionRoute } from './routes/submission.route';
import { CampaignRoute } from './routes/campaign.route';

export const openAIHelper = initializeOpenAI();

const app = new App([new SubmissionRoute(), new CampaignRoute()]);

app.listen();
