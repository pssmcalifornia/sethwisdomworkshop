# Connect the existing workshop form to Google Sheets

This is the **replacement for the FormSubmit backend**, not a new public registration form. The live public page remains:
https://pssmcalifornia.github.io/sethwisdomworkshop/

## 1. Set up the private Google spreadsheet
- Sign in with pssmcalifornia@gmail.com.
- Open your existing workshop registration Google Sheet.
- Copy the **spreadsheet ID** from the URL between \`/d/\` and \`/edit\`.
- Keep the spreadsheet **private**. Do not commit this ID or attendee information to GitHub.

## 2. Deploy the receiver
- At https://script.google.com/ create a new Apps Script project (or open your existing project).
- Paste the contents of \`google-sheets-registration/Code.gs\` into the script editor.
- Set \`SPREADSHEET_ID\` to your actual spreadsheet ID.
- Save, then click **Deploy > New deployment**.
- Select type **Web app**.
- Set **Execute as: Me**, and **Who has access: Anyone** so workshop attendees do not have to log in.
- Click Deploy, authorize spreadsheet access, and copy the Web app URL (it normally ends with \`/exec\`).
- **Security note:** Anyone with the public endpoint can submit data. It provides basic validation and a honeypot but is not hardened for high-volume spam.

## 3. Update the GitHub registration form (after deployment)
- In \`index.html\`, replace the form action
  \`https://formsubmit.co/pssmcalifornia@gmail.com\`
  with your **actual deployed Apps Script web app /exec URL**.
- Keep \`method="POST"\`. Do **not** use AJAX, fetch, or preventDefault.
- You may remove the FormSubmit-specific hidden inputs \`_subject\`, \`_template\`, and \`_next\`. Keep \`_honey\` if desired.
- Update the privacy note to explain that the information is recorded in the organization's private Google Sheet.
- Commit the website update only **after** obtaining the deployment URL. This avoids breaking the working public registration page prematurely.

## 4. Test
- Submit one clearly labeled test registration.
- Check the spreadsheet tab \`Registrations\` for a new row with timestamp, full name, mobile, email, and city.
- Verify the confirmation page shows the workshop flyer and Anu Venkat contact.
- If it doesn't work, inspect Apps Script **Executions**, not only the website.

## Technical notes
- Google Apps Script HTML output is a separate confirmation page served by Google. The original GitHub registration **form** looks the same, but its browser URL changes to Google after submission.
- The script stores submissions directly in Google Sheets; Gmail scanning/scheduled sync is no longer necessary for **new** registrations.
- Existing registration emails are not imported automatically. Retain the old script if you still need to backfill historic registrations.
- Save a deployment version and update the deployment when changing the Apps Script source.
