# gRPC Typeorm Infrastructure

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/grpc-typeorm-infrastructure.svg)](https://www.npmjs.com/package/grpc-typeorm-infrastructure)
[![npm](https://img.shields.io/npm/dw/grpc-typeorm-infrastructure.svg)](https://www.npmjs.com/package/grpc-typeorm-infrastructure)
![](https://img.shields.io/bundlephobia/min/grpc-typeorm-infrastructure.svg?style=flat)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

This library provides a simple wrapper around [TypeORM](http://typeorm.io) functions in order to provide consistent and predictable error messages, it uses [gRPC Boom](https://github.com/nicolaspearson/grpc.boom) to generate the gRPC-friendly error objects.

It is assumed that you are using the `grpc` library.

## Installation

```
npm install grpc-typeorm-infrastructure --save
```

Install the `grpc` library:

```
npm install grpc --save
```

## Usage

### Step 1:

Create a TypeORM entity:

```typescript
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'hero' })
export default class Hero {
	@PrimaryGeneratedColumn()
	public id?: number;

	@Column({ name: 'name', length: 500 })
	public name: string;

	@Column({ name: 'identity', length: 500 })
	public identity: string;

	@Column({ name: 'hometown', length: 500 })
	public hometown: string;

	@Column({ name: 'age' })
	public age: number;

	@CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
	public createdAt?: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
	public updatedAt?: Date;

	@Column({ name: 'deleted_at', nullable: true, type: 'timestamp with time zone' })
	public deletedAt?: Date;
}
```

### Step 2:

Create a repository for the entity above:

```typescript
import BaseRepository from 'grpc-typeorm-infrastructure';

import Hero from '@entities/hero.entity';

export default class HeroRepository extends BaseRepository<Hero> {
	constructor() {
		super(Hero.name);
	}
}
```

### Step 3:

Create a service for the entity above:

```typescript
import { BaseService } from 'grpc-typeorm-infrastructure';

import Hero from '@entities/hero.entity';

export default class HeroService extends BaseService<Hero> {
	constructor(heroRepository: HeroRepository) {
		super(heroRepository);
	}

	public preSaveHook(hero: Hero): void {
		// Executed before the save repository call
		delete hero.id;
	}

	public preUpdateHook(hero: Hero) {
		// Executed before the update repository call
		delete hero.updatedAt;
	}

	public preDeleteHook(hero: Hero) {
		// Executed before the delete repository call
		hero.deletedAt = new Date();
	}

	public preResultHook(hero: Hero) {
		// Executed before the result is returned
		delete hero.deletedAt;
	}
}
```

## Repository API

The base repository will give you access to the following methods:

```typescript
getAll(options?: FindManyOptions<T>): Promise<T[]>;
findManyByFilter(options: FindManyOptions<T>): Promise<T[]>;
findOneById(id: number): Promise<T>;
findOneByIdWithOptions(id: number, options?: FindOneOptions<T>): Promise<T>;
findManyById(idList: number[], options?: FindOneOptions<T>): Promise<T[]>;
findOneByFilter(options: FindOneOptions<T>): Promise<T>;
save(record: T, options?: SaveOptions): Promise<T>;
saveAll(
	records: T[],
	options?: SaveOptions,
	resolveRelations?: boolean
): Promise<T[]>;
updateOneById(id: number, record: T, options?: SaveOptions): Promise<T>;
deleteOneById(
	id: number,
	findOptions?: FindOneOptions<T>,
	deleteOptions?: RemoveOptions
): Promise<T>;
deleteManyById(idList: number[], deleteOptions?: RemoveOptions): Promise<T>;
findOneWithQueryBuilder(
	options: ISearchQueryBuilderOptions
): Promise<T | undefined>;
findManyWithQueryBuilder(options: ISearchQueryBuilderOptions): Promise<T[]>;
delete(record: T, options?: RemoveOptions);
```

## Service API

The base service will give you access to the following methods:

```typescript
preSaveHook(entity: T): void;
preUpdateHook(entity: T): void;
preDeleteHook(entity: T): void;
preResultHook(entity: T): void;
validId(id: number): boolean;
isValid(entity: T): Promise<boolean>;
findAll(): Promise<T[]>;
findAllByFilter(filter: FindManyOptions<T>): Promise<T[]>;
findOneById(id: number): Promise<T>;
findOneByFilter(filter: FindOneOptions<T>): Promise<T>;
findOneWithQueryBuilder(options: ISearchQueryBuilderOptions): Promise<T>;
findManyWithQueryBuilder(options: ISearchQueryBuilderOptions): Promise<T[]>;
search(limit: number, searchTerms: SearchTerm[]);
save(entity: T): Promise<T>;
saveAll(entities: T[]): Promise<T[]>;
update(entity: T, id: number): Promise<T>;
updateAll(entities: T[]): Promise<T[]>;
getSearchFilter(
	limit: number,
	searchTerms: SearchTerm[]
): ISearchQueryBuilderOptions;
delete(id: number): Promise<T>;
softDelete(id: number): Promise<T>;
```
