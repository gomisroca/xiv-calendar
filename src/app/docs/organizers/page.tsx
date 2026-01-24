function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-start text-sm text-slate-800 dark:text-slate-200">
      {children}
    </p>
  );
}

export default async function OrganizersHandbookPage() {
  return (
    <div className="w-full max-w-xl rounded-xl bg-white p-8 text-center shadow-sm dark:bg-black">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <span aria-hidden>📖</span>
      </div>
      <h1 className="text-2xl font-semibold">Organizer’s Handbook</h1>
      <div className="mt-6 flex flex-col gap-2 text-start">
        <h3 className="text-lg font-semibold uppercase">
          Creating an organization
        </h3>
        <Paragraph>
          To create an organization, fill out a short form with the
          organization’s name and the Discord channel where event updates should
          be posted.
        </Paragraph>

        <Paragraph>
          To get a channel ID in Discord, enable <strong>Developer Mode</strong>
          , then right-click the desired channel and select{" "}
          <strong>Copy ID</strong>.
        </Paragraph>

        <Paragraph>
          Finally, you’ll be prompted to invite the XIV Calendar bot to your
          Discord server. Without this step, events cannot be posted
          automatically. You’ll be able to review and confirm the bot’s
          permissions during the invite.
        </Paragraph>

        <h3 className="text-lg font-semibold uppercase">Setting up Roles</h3>
        <Paragraph>
          Organization creators can set up custom roles for members to
          administer the organization and its events.
        </Paragraph>

        <Paragraph>
          Some of the powers creators can assign to roles include:
          <ul className="list-disc pl-5 text-start">
            <li>Handle events</li>
            <li>Manage members</li>
            <li>Manage roles</li>
            <li>Update organization settings</li>
          </ul>
        </Paragraph>

        <Paragraph>
          By default, the <strong>Admin</strong> and <strong>User </strong>{" "}
          roles are created for you. The Admin role has all permissions, while
          the User role only has the ability to create events and RSVP to them.
        </Paragraph>
      </div>
    </div>
  );
}
