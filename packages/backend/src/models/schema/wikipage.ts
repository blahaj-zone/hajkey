export const packedWikiPageSchema = {
	type: "object",
	properties: {
		id: {
			type: "string",
			nullable: false,
			optional: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		revisionId: {
			type: "string",
			nullable: false,
			optional: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		createdAt: {
			type: "string",
			nullable: false,
			optional: false,
			format: "date-time",
		},
		updatedAt: {
			type: "string",
			nullable: false,
			optional: false,
			format: "date-time",
		},
		locked: {
			type: "boolean",
			nullable: false,
			optional: false,
			example: false,
		},
		editorIds: {
			type: "array",
			nullable: false,
			optional: false,
			items: {
				type: "string",
				format: "id",
				example: "xxxxxxxxxx",
			},
		},
		ownerId: {
			type: "string",
			nullable: true,
			optional: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		owner: {
			type: "object",
			ref: "UserLite",
			optional: true,
			nullable: true,
		},
		editorId: {
			type: "string",
			nullable: true,
			optional: false,
			format: "id",
			example: "xxxxxxxxxx",
		},
		editor: {
			type: "object",
			ref: "UserLite",
			optional: true,
			nullable: true,
		},
		slug: {
			type: "string",
			nullable: false,
			optional: false,
			example: "hello-world",
		},
		title: {
			type: "string",
			nullable: false,
			optional: false,
			example: "Hello World",
		},
		body: {
			type: "string",
			nullable: false,
			optional: false,
			example: "Hello World",
		},
	},
} as const;


