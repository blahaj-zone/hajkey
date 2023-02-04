const fs = require('fs');
const execa = require('execa');

(async () => {
	fs.rmSync(__dirname + '/../packages/backend/built', { recursive: true, force: true });
	fs.rmSync(__dirname + '/../packages/backend/node_modules', { recursive: true, force: true });

	fs.rmSync(__dirname + '/../packages/client/built', { recursive: true, force: true });
	fs.rmSync(__dirname + '/../packages/client/node_modules', { recursive: true, force: true });

	fs.rmSync(__dirname + '/../packages/sw/built', { recursive: true, force: true });
	fs.rmSync(__dirname + '/../packages/sw/node_modules', { recursive: true, force: true });

	fs.rmSync(__dirname + '/../built', { recursive: true, force: true });
	fs.rmSync(__dirname + '/../node_modules', { recursive: true, force: true });

	execa('pnpm', ['store', 'prune'], {
		cwd: __dirname + '/../',
		stdio: 'inherit'
	});
})();
