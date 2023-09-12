use sea_orm::entity::prelude::*;
use sea_orm::Schema;

use sea_orm_migration::{
    prelude::*,
    sea_orm::{DbBackend, Statement},
};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() == DbBackend::Sqlite {
            return Ok(());
        }

        let db = manager.get_connection();
        db.query_one(Statement::from_string(
            DbBackend::Postgres,
            Table::drop()
                .table(Entity)
                .if_exists()
                .to_string(PostgresQueryBuilder),
        ))
        .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() == DbBackend::Sqlite {
            return Ok(());
        }

        let db = manager.get_connection();
        let builder = db.get_database_backend();
        let schema = Schema::new(builder);

        db.execute(builder.build(&schema.create_table_from_entity(Entity)))
            .await?;

        Ok(())
    }
}

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Default)]
#[sea_orm(table_name = "ad")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: String,
    #[sea_orm(column_name = "createdAt")]
    pub created_at: DateTimeWithTimeZone,
    #[sea_orm(column_name = "expiresAt")]
    pub expires_at: DateTimeWithTimeZone,
    pub place: String,
    pub priority: String,
    pub url: String,
    #[sea_orm(column_name = "imageUrl")]
    pub image_url: String,
    pub memo: String,
    pub ratio: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
