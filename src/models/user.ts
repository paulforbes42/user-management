import {DataTypes, Optional} from 'sequelize';
import {
    Model,
    Table,
    Column,
    PrimaryKey,
    Unique,
    Default,
    DefaultScope,
    Scopes,
} from 'sequelize-typescript';

export interface UserAttributes {
    id: string
    email: string
    password: string
    firstName: string
    lastName: string
    activated: boolean
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'activated'> {}

@DefaultScope(() => ({
    attributes: {
        exclude: ['password']
    }
}))
@Scopes(() => ({
    full: {
        attributes: {
            include: ['password']
        }
    }
}))
@Table({
    tableName: 'user',
    paranoid: true,
})
class UserModel extends Model<UserAttributes, UserCreationAttributes> {
    @PrimaryKey
    @Default(DataTypes.UUIDV4())
    @Column
    override id!: string

    @Unique
    @Column
    email!: string

    @Column({
        field: 'first_name'
    })
    firstName!: string

    @Column({
        field: 'last_name'
    })
    lastName!: string

    @Column
    password!: string

    @Default(false)
    @Column
    activated!: boolean

    @Column({
        field: 'created_at'
    })
    override createdAt!: Date

    @Column({
        field: 'updated_at'
    })
    override updatedAt!: Date

    @Column({
        field: 'deleted_at'
    })
    override deletedAt!: Date
}

export default UserModel;