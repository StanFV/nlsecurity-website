import MicrosoftEntraID from "@auth/core/providers/microsoft-entra-id";
import { defineConfig } from "auth-astro";

export default defineConfig({
	providers: [
		MicrosoftEntraID({
			clientId: import.meta.env.AUTH_MICROSOFT_ENTRA_ID_ID,
			clientSecret: import.meta.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
			issuer: `https://login.microsoftonline.com/${import.meta.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
		}),
	],
	callbacks: {
		async signIn({ user }) {
			// Alleen inloggen toestaan voor bc-capital.nl domein
			if (user.email?.endsWith("@bc-capital.nl")) {
				return true;
			}
			return false;
		},
	},
});
