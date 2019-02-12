# gRPC Typeorm Infrastructure

[![License][license-image]][license-url]
[![Current Version](https://img.shields.io/npm/v/grpc-typeorm-infrastructure.svg)](https://www.npmjs.com/package/grpc-typeorm-infrastructure)
[![npm](https://img.shields.io/npm/dw/grpc-typeorm-infrastructure.svg)](https://www.npmjs.com/package/grpc-typeorm-infrastructure)
![](https://img.shields.io/bundlephobia/min/grpc-typeorm-infrastructure.svg?style=flat)

[license-url]: https://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/make-coverage-badge.svg

Simple generic class implementation for [TypeORM](http://typeorm.io) utilising the repository pattern. This library uses [gRPC Boom](https://github.com/nicolaspearson/grpc.boom) to generate gRPC-friendly error objects.

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
import GrpcBoom from 'grpc-typeorm-infrastructure';
import {
	IsEmail,
	IsOptional,
	Length,
	validate,
	ValidationArguments,
	ValidationError
} from 'class-validator';
import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ name: 'username', length: 255 })
	@Length(3, 255, {
		message: (args: ValidationArguments) => {
			return User.getGenericValidationLengthMessage(args);
		}
	})
	public username: string;

	@Column({ name: 'password', length: 255 })
	@Length(4, 255, {
		message: (args: ValidationArguments) => {
			return User.getGenericValidationLengthMessage(args);
		}
	})
	@IsOptional()
	public password: string;

	@Column({ name: 'email_address', length: 255 })
	@IsEmail(
		{},
		{
			message: 'Must be a valid email address'
		}
	)
	public emailAddress: string;

	@CreateDateColumn({ name: 'created_at' })
	public createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	public updatedAt: Date;

	public static newUser(obj: {
		id?: number;
		username?: string;
		emailAddress?: string;
		password?: string;
	}) {
		const newUser = new User();
		if (obj.id) {
			newUser.id = obj.id;
		}
		if (obj.username) {
			newUser.username = obj.username;
		}
		if (obj.emailAddress) {
			newUser.emailAddress = obj.emailAddress;
		}
		if (obj.password) {
			newUser.password = obj.password;
		}
		return newUser;
	}

	public static getGenericValidationLengthMessage(args: ValidationArguments) {
		return 'Incorrect length: Found ' + args.constraints[0] + ' characters';
	}

	public async isValid(): Promise<boolean> {
		try {
			const errors: ValidationError[] = await validate(this, {
				validationError: { target: true, value: true }
			});
			if (errors.length > 0) {
				const metadata = new Metadata();
				for (const item of errors) {
					if (item.property && item.constraints) {
						let value: string = 'Unknown error';
						for (const val of Object.values(item.constraints)) {
							value = val;
							break;
						}
						metadata.add(item.property, value);
					}
				}
				throw GrpcBoom.invalidArgument('Validation failed on the provided request', metadata);
			}
			return true;
		} catch (error) {
			if (error && error.isBoom) {
				throw error;
			}
			throw GrpcBoom.invalidArgument('Unable to validate request: ' + error);
		}
	}
}
```

### Step 2:

Create a repository for the entity above:

```typescript
import { BaseRepository } from 'grpc-typeorm-infrastructure';

export default class UserRepository extends BaseRepository<User> {
	constructor() {
		super(User.name);
	}
}
```

### Step 3:

Create a service for the entity above:

```typescript
import { BaseService } from 'grpc-typeorm-infrastructure';

export default class UserService extends BaseService<User> {
	constructor(private repository: UserRepository) {
		super(repository);
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
getSearchFilter(
	limit: number,
	searchTerms: SearchTerm[]
): ISearchQueryBuilderOptions;
delete(id: number): Promise<T>;
```
