import * as nodemailer from "nodemailer";
import { fetchMeta } from "@/misc/fetch-meta.js";
import Logger from "./logger.js";
import config from "@/config/index.js";

export const logger = new Logger("email");

export async function sendEmail(
	to: string,
	subject: string,
	html: string,
	text: string,
) {
	const meta = await fetchMeta(true);

	const iconUrl = `${config.url}/static-assets/mi-white.png`;
	const emailSettingUrl = `${config.url}/settings/email`;

	const enableAuth = meta.smtpUser != null && meta.smtpUser !== "";

	const transporter = nodemailer.createTransport({
		host: meta.smtpHost,
		port: meta.smtpPort,
		secure: meta.smtpSecure,
		ignoreTLS: !enableAuth,
		proxy: config.proxySmtp,
		auth: enableAuth
			? {
					user: meta.smtpUser,
					pass: meta.smtpPass,
			  }
			: undefined,
	} as any);

	try {
		// TODO: htmlサニタイズ
		const info = await transporter.sendMail({
			from: meta.email!,
			to: to,
			subject: subject,
			text: text,
			html: `<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>${subject}</title>
		<style>
			html {
				background: #191724;
			}

			body {
				padding: 16px;
				margin: 0;
				font-family: sans-serif;
				font-size: 14px;
			}

			a {
				text-decoration: none;
				color: #31748f;
			}
			a:hover {
				text-decoration: underline;
			}

			main {
				max-width: 500px;
				margin: 0 auto;
				background: #1f1d2e;
				color: #e0def4;
			}
				main > header {
					padding: 32px;
					background: #31748f;
					display: flex;
				}
					main > header > img {
						max-width: 128px;
						max-height: 72px;
						vertical-align: bottom;
						margin-right: 16px;
					}
				main > article {
					padding: 32px;
				}
					main > article > h1 {
						margin: 0 0 1em 0;
					}
				main > footer {
					padding: 32px;
					border-top: solid 1px #26233a;
				}

			nav {
				box-sizing: border-box;
				max-width: 500px;
				margin: 16px auto 0 auto;
				padding: 0 32px;
			}
				nav > a {
					color: #6e6a86;
				}
		</style>
	</head>
	<body>
		<main>
			<header>
				<img src="${meta.logoImageUrl || meta.iconUrl || iconUrl}" height="100"/>
				<h1>${meta.name}</h1>
			</header>
			<article>
				<h1>${subject}</h1>
				<div>${html}</div>
			</article>
			<footer>
				<a href="${emailSettingUrl}">${"Email setting"}</a>
			</footer>
		</main>
		<nav>
			<a href="${config.url}">${config.host}</a>
		</nav>
	</body>
</html>`,
		});

		logger.info(`Message sent: ${info.messageId}`);
	} catch (err) {
		logger.error(err as Error);
		throw err;
	}
}
