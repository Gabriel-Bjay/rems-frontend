import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AppNotification, BillingApi } from '../../core/services/billing-api';
import { timeAgo } from '../../core/utils/format';

const POLL_MS = 60_000;

// Small stroke icons per notification type; anything else gets the bell.
const EVENT_ICONS: Record<string, string> = {
    payment_received: 'M20 6L9 17l-5-5',
    invoice_issued: 'M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21zM10 8h4M10 12h4',
    invoice_overdue: 'M12 8v5M12 16.5v.5M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
    maintenance_update: 'M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
};
const BELL_ICON = 'M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0';

/** Top-bar bell: unread count, the latest notifications, and a link to what each one is about. */
@Component({
    selector: 'app-notification-bell',
    standalone: true,
    templateUrl: './notification-bell.html',
    styleUrl: './notification-bell.css',
})
export class NotificationBell implements OnInit, OnDestroy {
    private billing = inject(BillingApi);
    private router = inject(Router);
    private poll?: ReturnType<typeof setInterval>;

    notifications = signal<AppNotification[]>([]);
    unread = computed(() => this.notifications().filter(n => !n.is_read).length);
    open = signal(false);

    readonly bellIcon = BELL_ICON;
    readonly timeAgo = timeAgo;
    readonly eventIcon = (event: string) => EVENT_ICONS[event] ?? BELL_ICON;

    ngOnInit() {
        this.load();
        this.poll = setInterval(() => this.load(), POLL_MS);
    }

    ngOnDestroy() {
        clearInterval(this.poll);
    }

    async load() {
        try {
            this.notifications.set((await this.billing.notifications()).slice(0, 20));
        } catch {
            // The bell is a convenience; a failed poll should not interrupt the page.
        }
    }

    toggle() {
        this.open.update(open => !open);
        if (this.open()) {
            this.load();
        }
    }

    select(notification: AppNotification) {
        this.open.set(false);
        if (!notification.is_read) {
            this.notifications.update(list => list.map(n => (n.id === notification.id ? { ...n, is_read: true } : n)));
            this.billing.markNotificationRead(notification.id).catch(() => this.load());
        }
        if (notification.related_url) {
            this.router.navigateByUrl(notification.related_url);
        }
    }

    markAllRead() {
        this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
        this.billing.markAllNotificationsRead().catch(() => this.load());
    }
}
