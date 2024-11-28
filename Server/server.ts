import express, { Request, Response } from 'express';
import { chromium } from 'playwright';
import cors from 'cors';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cors());

interface PlaywrightAction {
  name: string;
  selector?: string;
  value?: string;
  key?: string;
}

interface RunScriptRequestBody {
  actions: PlaywrightAction[];
}

app.post('/run-script', async (req: Request<{}, {}, RunScriptRequestBody>, res: Response) => {
  const { actions } = req.body;
  if (!actions || !Array.isArray(actions)) {
    return res.status(400).send('Invalid actions.');
  }

  try {
    await runPlaywrightScript(actions);
    res.send('Script executed successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Script execution failed.');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

async function runPlaywrightScript(actions: PlaywrightAction[]) {
  const userDataDir = path.resolve(__dirname, 'user-data-dir');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
  });

  const page = context.pages()[0] || (await context.newPage());

  await new Promise(resolve => setTimeout(resolve, 2000));

  for (const action of actions) {
    switch (action.name) {
      case 'navigate':
        await page.goto(action.value || '');
        break;
      case 'click':
        await page.click(action.selector!);
        break;
      case 'fill':
        await page.fill(action.selector!, action.value || '');
        break;
      case 'press':
        await page.focus(action.selector!);
        await page.keyboard.press(action.key!);
        break;
      default:
        console.warn(`Unknown action: ${action.name}`);
    }
  }

  // Optionally close the context or keep it open
  // await context.close();
}
