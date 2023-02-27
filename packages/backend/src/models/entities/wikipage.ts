import {
	Entity,
	Column,
	Index,
	OneToOne,
	JoinColumn,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";
import { User } from "./user.js";

@Entity()
export class WikiPage {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the WikiPage.',
	})
	public createdAt: Date;

	@Index({ unique: true })
	@Column('varchar', {
		length: 64,
		comment: 'The slug of the WikiPage.',
	})
	public slug: string;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'The owner of the WikiPage.'
	})
	public ownerId: User["id"];

	@OneToOne(type => User, {
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public owner: User | null;

	@Column('boolean', {
		default: false,
		comment: "Whether the WikiPage is locked to the owner, or open to editors / everyone."
	})
	public locked: boolean;

	@Column({
		...id(),
		array: true,
		comment: 'The allowed editors of the WikiPage.',
	})
	public editorIds: User["id"][];

	@Column({
		...id(),
		comment: 'The currently live version of the WikiPage.'
	})
	public revisionId: WikiPageRevision["id"];

	@OneToOne(type => WikiPageRevision, {
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public revision: WikiPageRevision | null;
}

@Entity()
export class WikiPageRevision {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone', {
		comment: 'The created date of the WikiPageRevision.',
	})
	public createdAt: Date;

	@Index()
	@Column(id())
	public wikiPageId: WikiPage["id"];

	@Index()
	@Column(id())
	public editorId: User["id"];

	@OneToOne(type => User, {
		onDelete: 'SET NULL',
	})
	@JoinColumn()
	public editor: User | null;

	@Column('varchar', {
		length: 128,
		comment: 'The title of the WikiPage.',
	})
	public title: string;

	@Column('varchar', {
		comment: 'The body of the WikiPage.',
	})
	public body: string;
}
