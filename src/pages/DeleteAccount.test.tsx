import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DeleteAccount from "./DeleteAccount";
import { mockFetch, type Reply } from "@/test/fetch-mock";
import { auth, fakeClient, resetFakeSupabase, state } from "@/test/fake-supabase";

vi.mock("@/lib/supabase", () => ({ getSupabase: () => fakeClient }));

// A token signed in just now, so the page shows the form rather than asking for a fresh sign-in.
const freshToken = () =>
  `h.${btoa(JSON.stringify({ amr: [{ timestamp: Math.floor(Date.now() / 1000) - 5 }] })).replace(/=+$/, "")}.sig`;

const unreachable: Reply = { status: 503, body: { status: "error", code: "BILLING_UNREACHABLE" } };
const deleted = (extra: object = {}): Reply => ({ status: 200, body: { status: "success", data: { deleted: true, email_sent: true, ...extra } } });

async function submitDelete() {
  render(<MemoryRouter><DeleteAccount /></MemoryRouter>);
  fireEvent.change(await screen.findByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
  fireEvent.click(screen.getByRole("button", { name: "Delete my account" }));
}

beforeEach(() => {
  resetFakeSupabase();
  state.session = {
    access_token: freshToken(), refresh_token: "rt", expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: { email: "reader@example.com" },
  } as typeof state.session;
});
afterEach(cleanup);

describe("/account/delete — payment provider unreachable", () => {
  it("offers the two options, focuses Try again later, and Escape closes without deleting", async () => {
    const { calls } = mockFetch({ "DELETE /user/account": unreachable });
    await submitDelete();
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog.textContent).toContain("We can't reach our payment provider to cancel your subscription.");
    expect(dialog.textContent).toContain("Don't delete yet.");
    expect(dialog.textContent).toContain("Our support team will then cancel any remaining subscription for you");
    expect(dialog.textContent).not.toContain("keep charging");
    const later = screen.getByRole("button", { name: "Try again later" });
    await waitFor(() => expect(document.activeElement).toBe(later));
    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(calls).toHaveLength(1);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(auth.signOut).not.toHaveBeenCalled();
  });

  it("Try again later closes the dialog and changes nothing", async () => {
    const { calls } = mockFetch({ "DELETE /user/account": unreachable });
    await submitDelete();
    fireEvent.click(await screen.findByRole("button", { name: "Try again later" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    expect(calls).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Delete my account" })).toBeTruthy();
  });

  it("Delete anyway re-sends with the flag and shows the support ticket", async () => {
    const { calls } = mockFetch({
      "DELETE /user/account": [unreachable, deleted({ billing_unverified: true, support_ticket_id: "TCK-1042" })],
    });
    await submitDelete();
    fireEvent.click(await screen.findByRole("button", { name: "Delete anyway" }));
    expect(await screen.findByText("Your account has been deleted.")).toBeTruthy();
    expect(screen.getByText(
      "We've opened support ticket TCK-1042. We'll cancel any remaining subscription for you and email you to confirm. " +
      "You don't need to do anything.",
    )).toBeTruthy();
    expect(screen.getByRole("status").textContent).not.toContain("Stripe");
    expect(calls).toHaveLength(2);
    expect(JSON.parse(String(calls[0].init.body))).toEqual({ confirm: "DELETE" });
    expect(JSON.parse(String(calls[1].init.body)))
      .toEqual({ confirm: "DELETE", confirm_billing_unreachable: true, channel: "Website" });
  });

  it("Delete anyway without a ticket asks the user to email support", async () => {
    mockFetch({ "DELETE /user/account": [unreachable, deleted({ billing_unverified: true })] });
    await submitDelete();
    fireEvent.click(await screen.findByRole("button", { name: "Delete anyway" }));
    expect(await screen.findByText("Your account has been deleted.")).toBeTruthy();
    expect(screen.getByText("Please email support@truthscore.ai so we can cancel your subscription for you.")).toBeTruthy();
    expect(screen.getByRole("status").textContent).not.toContain("Stripe");
  });

  it("Delete anyway answered with SUBSCRIPTION_ACTIVE shows the existing copy", async () => {
    mockFetch({
      "DELETE /user/account": [unreachable, { status: 409, body: { status: "error", code: "SUBSCRIPTION_ACTIVE" } }],
    });
    await submitDelete();
    fireEvent.click(await screen.findByRole("button", { name: "Delete anyway" }));
    expect((await screen.findByRole("alert")).textContent).toContain("You have an active subscription.");
  });

  it("a normal deletion has no subscription note", async () => {
    mockFetch({ "DELETE /user/account": deleted() });
    await submitDelete();
    expect(await screen.findByText("Your account has been deleted.")).toBeTruthy();
    expect(screen.queryByText(/support ticket/)).toBeNull();
    expect(screen.queryByText(/so we can cancel your subscription/)).toBeNull();
  });
});
