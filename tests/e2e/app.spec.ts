// src/tests/e2e/app.spec.ts
import { test, expect, Browser, BrowserContext, Page } from "@playwright/test";

// ---- helpers ----

async function clearStorage(page: Page) {
	await page.evaluate(() => {
		localStorage.clear();
	});
}

async function seedUser(
	page: Page,
	email: string,
	password: string,
	userId = "user-1",
) {
	await page.evaluate(
		({ email, password, userId }) => {
			const users = [
				{
					id: userId,
					email,
					password,
					createdAt: new Date().toISOString(),
				},
			];
			localStorage.setItem("habit-tracker-users", JSON.stringify(users));
		},
		{ email, password, userId },
	);
}

async function seedSession(page: Page, email: string, userId = "user-1") {
	await page.evaluate(
		({ email, userId }) => {
			const session = { userId, email };
			localStorage.setItem(
				"habit-tracker-session",
				JSON.stringify(session),
			);
		},
		{ email, userId },
	);
}

async function seedHabit(
	page: Page,
	name: string,
	userId = "user-1",
	completions: string[] = [],
) {
	await page.evaluate(
		({ name, userId, completions }) => {
			const existing = JSON.parse(
				localStorage.getItem("habit-tracker-habits") || "[]",
			);
			const habit = {
				id: crypto.randomUUID(),
				userId,
				name,
				description: "",
				frequency: "daily",
				createdAt: new Date().toISOString(),
				completions,
			};
			localStorage.setItem(
				"habit-tracker-habits",
				JSON.stringify([...existing, habit]),
			);
		},
		{ name, userId, completions },
	);
}

async function signupAndLogin(page: Page, email: string, password: string) {
	await page.goto("/signup");
	await page.getByTestId("auth-signup-email").fill(email);
	await page.getByTestId("auth-signup-password").fill(password);
	await page.getByTestId("auth-signup-submit").click();
	await page.waitForURL("**/dashboard");
}

// ---- tests ----

test.describe("Habit Tracker app", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await clearStorage(page);
	});

	test("shows the splash screen and redirects unauthenticated users to /login", async ({
		page,
	}) => {
		await page.goto("/");

		// Splash screen must be immediately visible
		await expect(page.getByTestId("splash-screen")).toBeVisible();

		// Must show the app name
		await expect(page.getByTestId("splash-screen")).toContainText(
			"Habit Tracker",
		);

		// Must redirect to /login since no session exists
		await page.waitForURL("**/login", { timeout: 5000 });
		expect(page.url()).toContain("/login");

		// Login form must be present
		await expect(page.getByTestId("auth-login-email")).toBeVisible();
	});

	test("redirects authenticated users from / to /dashboard", async ({
		page,
	}) => {
		await page.goto("/");

		// Seed a valid session into localStorage
		await seedUser(page, "user@test.com", "password123");
		await seedSession(page, "user@test.com");

		// Revisit / with session present
		await page.goto("/");

		// Splash should show briefly
		await expect(page.getByTestId("splash-screen")).toBeVisible();

		// Then redirect to /dashboard since session exists
		await page.waitForURL("**/dashboard", { timeout: 5000 });
		expect(page.url()).toContain("/dashboard");

		// Dashboard must be rendered
		await expect(page.getByTestId("dashboard-page")).toBeVisible();
	});

	test("prevents unauthenticated access to /dashboard", async ({ page }) => {
		// Visit dashboard directly with no session
		await page.goto("/dashboard");

		// Must be redirected to /login
		await page.waitForURL("**/login", { timeout: 5000 });
		expect(page.url()).toContain("/login");

		// Dashboard must not be visible
		await expect(page.getByTestId("dashboard-page")).not.toBeVisible();
	});

	test("signs up a new user and lands on the dashboard", async ({ page }) => {
		await page.goto("/signup");

		await page.getByTestId("auth-signup-email").fill("newuser@test.com");
		await page.getByTestId("auth-signup-password").fill("password123");
		await page.getByTestId("auth-signup-submit").click();

		// Must redirect to dashboard after signup
		await page.waitForURL("**/dashboard", { timeout: 5000 });
		expect(page.url()).toContain("/dashboard");

		// Dashboard must be visible
		await expect(page.getByTestId("dashboard-page")).toBeVisible();

		// Session must be stored in localStorage
		const session = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-session") || "null"),
		);
		expect(session).not.toBeNull();
		expect(session.email).toBe("newuser@test.com");
		expect(session.userId).toBeDefined();

		// User must be stored in localStorage
		const users = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-users") || "[]"),
		);
		expect(users).toHaveLength(1);
		expect(users[0].email).toBe("newuser@test.com");
	});

	// test("logs in an existing user and loads only that user's habits", async ({
	// 	page,
	// }) => {
	// 	// Seed two users with separate habits
	// 	await page.goto("/");
	// 	await seedUser(page, "user1@test.com", "password123", "user-1");
	// 	await seedUser(page, "user2@test.com", "password456", "user-2");

	// 	// Seed one habit for each user
	// 	await seedHabit(page, "User One Habit", "user-1");
	// 	await seedHabit(page, "User Two Habit", "user-2");

	// 	// Log in as user 1
	// 	await page.goto("/login");
	// 	await page.getByTestId("auth-login-email").fill("user1@test.com");
	// 	await page.getByTestId("auth-login-password").fill("password123");
	// 	await page.getByTestId("auth-login-submit").click();

	// 	await page.waitForURL("**/dashboard", { timeout: 5000 });

	// 	// Only user 1's habit must be visible
	// 	await expect(
	// 		page.getByTestId("habit-card-user-one-habit"),
	// 	).toBeVisible();

	// 	// User 2's habit must NOT be visible
	// 	await expect(
	// 		page.getByTestId("habit-card-user-two-habit"),
	// 	).not.toBeVisible();
	// });

	test("logs in an existing user and loads only that user's habits", async ({
		page,
	}) => {
		// Navigate to login page FIRST, then seed data
		// because navigating wipes localStorage
		await page.goto("/login");

		// Now seed both users while already on the login page
		await page.evaluate(() => {
			const users = [
				{
					id: "user-1",
					email: "user1@test.com",
					password: "password123",
					createdAt: new Date().toISOString(),
				},
				{
					id: "user-2",
					email: "user2@test.com",
					password: "password456",
					createdAt: new Date().toISOString(),
				},
			];
			localStorage.setItem("habit-tracker-users", JSON.stringify(users));

			// Seed habits for both users
			const habits = [
				{
					id: "habit-1",
					userId: "user-1",
					name: "User One Habit",
					description: "",
					frequency: "daily",
					createdAt: new Date().toISOString(),
					completions: [],
				},
				{
					id: "habit-2",
					userId: "user-2",
					name: "User Two Habit",
					description: "",
					frequency: "daily",
					createdAt: new Date().toISOString(),
					completions: [],
				},
			];
			localStorage.setItem(
				"habit-tracker-habits",
				JSON.stringify(habits),
			);
		});

		// Verify data was seeded correctly before proceeding
		const users = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-users") || "[]"),
		);
		expect(users).toHaveLength(2);

		// Now log in as user 1
		await page.getByTestId("auth-login-email").fill("user1@test.com");
		await page.getByTestId("auth-login-password").fill("password123");
		await page.getByTestId("auth-login-submit").click();

		await page.waitForURL("**/dashboard", { timeout: 5000 });

		// Only user 1's habit must be visible
		await expect(
			page.getByTestId("habit-card-user-one-habit"),
		).toBeVisible();

		// User 2's habit must NOT be visible
		await expect(
			page.getByTestId("habit-card-user-two-habit"),
		).not.toBeVisible();
	});

	test("creates a habit from the dashboard", async ({ page }) => {
		await signupAndLogin(page, "user@test.com", "password123");

		// Empty state must be visible before creating
		await expect(page.getByTestId("empty-state")).toBeVisible();

		// Click the create habit button
		await page.getByTestId("create-habit-button").click();

		// Habit form must appear
		await expect(page.getByTestId("habit-form")).toBeVisible();

		// Fill in the habit name
		await page.getByTestId("habit-name-input").fill("Drink Water");
		await page.getByTestId("habit-description-input").fill("Stay hydrated");

		// Submit the form
		await page.getByTestId("habit-save-button").click();

		// Form must close
		await expect(page.getByTestId("habit-form")).not.toBeVisible();

		// Habit card must appear in the list
		await expect(page.getByTestId("habit-card-drink-water")).toBeVisible();

		// Empty state must be gone
		await expect(page.getByTestId("empty-state")).not.toBeVisible();

		// Habit must be persisted in localStorage
		const habits = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-habits") || "[]"),
		);
		expect(habits).toHaveLength(1);
		expect(habits[0].name).toBe("Drink Water");
		expect(habits[0].frequency).toBe("daily");
	});

	test("completes a habit for today and updates the streak", async ({
		page,
	}) => {
		const today = new Date().toISOString().split("T")[0];

		await signupAndLogin(page, "user@test.com", "password123");

		// Create a habit first
		await page.getByTestId("create-habit-button").click();
		await page.getByTestId("habit-name-input").fill("Exercise");
		await page.getByTestId("habit-save-button").click();

		// Habit card must be visible
		await expect(page.getByTestId("habit-card-exercise")).toBeVisible();

		// Streak must start at 0
		await expect(page.getByTestId("habit-streak-exercise")).toContainText(
			"0",
		);

		// Mark habit as complete for today
		await page.getByTestId("habit-complete-exercise").click();

		// Streak display must update immediately to 1
		await expect(page.getByTestId("habit-streak-exercise")).toContainText(
			"1",
		);

		// Completion must be saved to localStorage
		const habits = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-habits") || "[]"),
		);
		expect(habits[0].completions).toContain(today);

		// Click again to unmark — streak must go back to 0
		await page.getByTestId("habit-complete-exercise").click();
		await expect(page.getByTestId("habit-streak-exercise")).toContainText(
			"0",
		);

		// Completion must be removed from localStorage
		const habitsAfterUnmark = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-habits") || "[]"),
		);
		expect(habitsAfterUnmark[0].completions).not.toContain(today);
	});

	test("persists session and habits after page reload", async ({ page }) => {
		await signupAndLogin(page, "user@test.com", "password123");

		// Create a habit
		await page.getByTestId("create-habit-button").click();
		await page.getByTestId("habit-name-input").fill("Read Books");
		await page.getByTestId("habit-save-button").click();

		await expect(page.getByTestId("habit-card-read-books")).toBeVisible();

		// Reload the page
		await page.reload();

		// Must stay on dashboard — session still valid
		await page.waitForURL("**/dashboard", { timeout: 5000 });

		// Dashboard must still be visible
		await expect(page.getByTestId("dashboard-page")).toBeVisible();

		// Habit must still be visible after reload
		await expect(page.getByTestId("habit-card-read-books")).toBeVisible();

		// Session must still be in localStorage
		const session = await page.evaluate(() =>
			JSON.parse(localStorage.getItem("habit-tracker-session") || "null"),
		);
		expect(session).not.toBeNull();
		expect(session.email).toBe("user@test.com");
	});

	test("logs out and redirects to /login", async ({ page }) => {
		await signupAndLogin(page, "user@test.com", "password123");

		// Must be on dashboard
		await expect(page.getByTestId("dashboard-page")).toBeVisible();

		// Click logout button
		await page.getByTestId("auth-logout-button").click();

		// Must redirect to /login
		await page.waitForURL("**/login", { timeout: 5000 });
		expect(page.url()).toContain("/login");

		// Session must be cleared from localStorage
		const session = await page.evaluate(() =>
			localStorage.getItem("habit-tracker-session"),
		);
		expect(session).toBeNull();

		// Trying to go back to dashboard must redirect to login
		await page.goto("/dashboard");
		await page.waitForURL("**/login", { timeout: 5000 });
		expect(page.url()).toContain("/login");
	});

	test("loads the cached app shell when offline after the app has been loaded once", async ({
		browser,
	}) => {
		// Create a fresh context so we control network conditions
		const context: BrowserContext = await browser.newContext();
		const page: Page = await context.newPage();

		// First visit online — this allows the service worker to cache the app shell
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Wait for service worker to install and cache
		await page.waitForTimeout(2000);

		// Go offline
		await context.setOffline(true);

		// Visit the app while offline
		await page.goto("/");

		// App shell must load without a hard crash — no browser error page
		const bodyText = await page.locator("body").textContent();
		expect(bodyText).not.toContain("ERR_INTERNET_DISCONNECTED");
		expect(bodyText).not.toContain("ERR_CONNECTION_REFUSED");
		expect(bodyText).not.toContain("This site can't be reached");

		// The page must have rendered something meaningful
		const body = page.locator("body");
		await expect(body).not.toBeEmpty();

		// Go back online and clean up
		await context.setOffline(false);
		await context.close();
	});
});
