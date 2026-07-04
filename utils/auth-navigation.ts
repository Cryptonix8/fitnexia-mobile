let sessionExpiredAlertPending = false;

/** Show session-expired alert on the next login screen mount. */
export function markSessionExpiredAlertPending(): void {
  sessionExpiredAlertPending = true;
}

export function consumeSessionExpiredAlertPending(): boolean {
  const pending = sessionExpiredAlertPending;
  sessionExpiredAlertPending = false;
  return pending;
}

export function markSessionExpiredOnLogout(): void {
  markSessionExpiredAlertPending();
}
