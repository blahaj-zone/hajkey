export function isDuplicateKeyValueError(e: unknown | Error): boolean {
	return (e as Error).message?.startsWith("duplicate key value");
}
