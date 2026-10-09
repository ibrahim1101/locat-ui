/** Smoke tests: auth renders, sign-in reaches the chat shell, composer sends. */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import App from "../App";

afterEach(cleanup);

describe("App shell", () => {
  it("renders the auth screen with real controls", () => {
    render(<App />);
    expect(screen.getByTestId("auth-screen")).toBeTruthy();
    expect(screen.getByTestId("auth-username")).toBeTruthy();
    expect(screen.getByTestId("auth-submit")).toBeTruthy();
    expect(screen.getByText("New to Locat? Create account")).toBeTruthy();
  });

  it("signs in through the mock adapter and shows the conversation list", async () => {
    render(<App />);
    fireEvent.change(screen.getByTestId("auth-username"), { target: { value: "demo" } });
    fireEvent.change(screen.getByTestId("auth-password"), { target: { value: "demo-password" } });
    fireEvent.click(screen.getByTestId("auth-submit"));
    await waitFor(() => expect(screen.getByTestId("chats-screen")).toBeTruthy(), { timeout: 5000 });
    await waitFor(() => expect(screen.getByTestId("conversation-row-c-ava")).toBeTruthy(), { timeout: 5000 });
  });

  it("opens a conversation and sends a message through the composer", async () => {
    render(<App />);
    fireEvent.change(screen.getByTestId("auth-username"), { target: { value: "demo" } });
    fireEvent.change(screen.getByTestId("auth-password"), { target: { value: "demo-password" } });
    fireEvent.click(screen.getByTestId("auth-submit"));
    const row = await screen.findByTestId("conversation-row-c-ava", undefined, { timeout: 5000 });
    fireEvent.click(row);
    await waitFor(() => expect(screen.getByTestId("chat-window")).toBeTruthy(), { timeout: 5000 });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "smoke test message" } });
    fireEvent.click(screen.getByTestId("send-button"));
    // the text appears in the bubble and in the sidebar's last-message preview
    await waitFor(() => expect(screen.getAllByText("smoke test message").length).toBeGreaterThan(0));
  });
});
