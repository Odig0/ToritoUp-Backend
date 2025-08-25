import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CanonicalLoggingInterceptor } from './common/interceptors/canonical-logging.interceptor';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

async function bootstrap() {
  // If the secret was provided as an env var named ENV_FILE (contains .env content),
  // write it to a file so dotenv can load it. This avoids exposing secret values in logs.
  try {
    const secretEnv = process.env.ENV_FILE;
    const secretPath = '/secrets/envTorito';
    if (secretEnv) {
      // Ensure directory exists
      const dir = path.dirname(secretPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(secretPath, secretEnv, { encoding: 'utf8', mode: 0o600 });
      dotenv.config({ path: secretPath });
    } else if (fs.existsSync('/secrets/envTorito')) {
      dotenv.config({ path: '/secrets/envTorito' });
    } else {
      // fallback to normal env loading (no file)
      dotenv.config();
    }
  } catch (e) {
    // Don't expose secret contents; just log minimal info
    console.warn('Could not load secret file for dotenv:', (e && (e as Error).message) || e);
  }

  const app = await NestFactory.create(AppModule);
  // Register canonical logging interceptor globally
  app.useGlobalInterceptors(app.get(CanonicalLoggingInterceptor));
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
