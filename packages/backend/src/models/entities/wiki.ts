import {
	Entity,
	Column,
	Index,
	OneToOne,
	JoinColumn,
	PrimaryColumn,
} from "typeorm";
import { id } from "../id.js";

@Entity()
@Index(['slug'], { unique: true })
export class WikiPage {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		comment: 'The created date of the WikiPage.',
	})
	public created: Date;

	@Column('varchar', {
		length: 128,
		comment: 'The slug of the WikiPage.',
	})
	public slug: string;

	@Column('varchar', {
		length: 128,
		comment: 'The owner of the WikiPage.',
	})
	public owner: string;

	@Column('boolean', {
		default: false,
	})
	public locked: boolean;

	@Column('jsonb', {
		length: 128,
		comment: 'The allowed editors of the WikiPage.',
	})
	public editors: string[];

	@Column('string', {
		length: 128,
		comment: 'The currently live version of the WikiPage.'
	})
	public wikiRevisionId: string;
}

@Entity()
@Index(['wikiPageId', 'version'], { unique: true })
export class WikiPageRevision {
	@PrimaryColumn(id())
	public id: string;

	@Column('varchar', {
		length: 128,
		comment: 'The wikiPageId of the WikiPageRevision.',
	})
	public wikiPageId: string;

	@Column('timestamp with time zone', {
		comment: 'The created date of the WikiPageRevision.',
	})
	public created: Date;

	@Column('varchar', {
		length: 128,
		comment: 'The title of the WikiPage.',
	})
	public title: string;

	@Column('varchar', {
		length: 128,
		comment: 'The body of the WikiPage.',
	})
	public body: string;
}
