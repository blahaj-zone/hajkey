const execa = require("execa");

(async () => {
	await execa("pnpm", ["clean"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["dlx", "gulp", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "backend", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "client", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	execa("pnpm", ["--filter", "sw", "watch"], {
		cwd: __dirname + "/../",
		stdout: process.stdout,
		stderr: process.stderr,
	});

	const start = async () => {
		try {
			await execa("pnpm", ["start"], {
				cwd: __dirname + "/../",
				stdout: process.stdout,
				stderr: process.stderr,
			});
		} catch (e) {
			await new Promise((resolve) => setTimeout(resolve, 3000));
			start();
		}
	};

	start();
})();
