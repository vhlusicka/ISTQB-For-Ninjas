import { expect, test } from "@playwright/test";

test("starts, navigates, submits, reviews, and returns home", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /sharpen your test instinct/i })).toBeVisible();
  await page.getByRole("button", { name: "5", exact: true }).click();
  await page.getByRole("button", { name: /^start$/i }).click();

  await expect(page.getByRole("heading", { name: /question 1 of 5/i })).toBeVisible();
  await expect(page.getByText(/select one answer/i).first()).toBeVisible();
  await page.locator("label").first().click();
  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await page.getByRole("button", { name: "← Previous", exact: true }).click();
  await expect(page.locator("input:checked")).toHaveCount(1);

  await page.getByRole("button", { name: /finish the exam/i }).click();
  await expect(page.getByRole("alertdialog")).toContainText("unanswered");
  await page.getByRole("alertdialog").getByRole("button", { name: /finish the exam/i }).click();

  await expect(page.getByText(/final score/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /answer review/i })).toBeVisible();
  await page.getByRole("button", { name: /back to start/i }).click();
  await expect(page.getByRole("button", { name: /^start$/i })).toBeVisible();
});

test("enforces and preserves multi-answer selections", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    sessionStorage.setItem("istqb-active-exam", JSON.stringify([
      {
        id: 9001,
        questionText: "Multi-answer UI test fixture",
        requiredSelections: 2,
        answers: [
          { id: 9101, answerText: "First option" },
          { id: 9102, answerText: "Second option" },
          { id: 9103, answerText: "Third option" }
        ]
      },
      {
        id: 9002,
        questionText: "Navigation test fixture",
        requiredSelections: 1,
        answers: [
          { id: 9201, answerText: "First option" },
          { id: 9202, answerText: "Second option" }
        ]
      }
    ]));
  });
  await page.goto("/quiz");

  await expect(page.getByText("Select 2 answers").first()).toBeVisible();
  await page.locator("label").nth(0).click();
  await page.locator("label").nth(1).click();
  await page.locator("label").nth(2).click();
  await expect(page.getByRole("status")).toContainText("no more than 2");
  await expect(page.locator("input:checked")).toHaveCount(2);

  await page.getByRole("button", { name: "Next →", exact: true }).click();
  await page.getByRole("button", { name: "← Previous", exact: true }).click();
  await expect(page.locator("input:checked")).toHaveCount(2);
});
