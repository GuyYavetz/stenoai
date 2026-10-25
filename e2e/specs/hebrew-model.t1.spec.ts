import { test, expect } from '../fixtures/electron';

/**
 * T1 — renderer-only, mock IPC, no backend. Settings → Transcribe offers the
 * ivrit.ai Hebrew model download on the Whisper engine only (Parakeet can't
 * transcribe Hebrew, and the cloud engine never runs a local model), and the
 * Whisper language picker can pin Hebrew. The mock lists the model as not
 * installed, so the row shows its Download action. The list shape and the
 * on/off switch persisting to config are covered against the real backend in
 * model-management.t2.
 */

test('Whisper shows the Hebrew model download and can pin Hebrew', async ({ launchApp }) => {
  const { page } = await launchApp({
    mockIpc: true,
    env: { STENOAI_E2E_MOCK_ENGINE: 'whisper' },
  });
  await page.evaluate(() => {
    window.location.hash = '#/settings?tab=transcription';
  });

  const row = page.locator('[data-settings-tab="transcription"]').getByText('Hebrew model', { exact: true });
  await expect(row).toBeVisible();
  await expect(page.getByText(/ivrit\.ai's Hebrew-trained Whisper/)).toBeVisible();
  await expect(page.getByText(/Downloads 1\.6 GB\./)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download', exact: true })).toBeVisible();

  await page.getByTestId('transcription-language-select').click();
  await page.getByRole('option', { name: 'Hebrew', exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => window.stenoai.settings.getLanguage()))
    .toMatchObject({ success: true, language: 'he' });
});

test('Parakeet hides the Hebrew model row', async ({ launchApp }) => {
  const { page } = await launchApp({ mockIpc: true });
  await page.evaluate(() => {
    window.location.hash = '#/settings?tab=transcription';
  });

  await expect(page.getByTestId('transcription-model-select')).toBeVisible();
  await expect(page.getByText('Hebrew model', { exact: true })).toHaveCount(0);
});
