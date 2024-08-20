/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.createTable('products', function (table) {
        table.increments('id').primary();
        table.string('type').nullable();
        table.string('v2_productID').nullable();
        table.string('gcpGLNID').nullable();
        table.string('productnameenglish', 'longtext').notNullable().unique();
        table.string('productnamearabic').nullable().unique();
        table.string('slug').nullable();
        table.string('BrandName').nullable();
        table.string('BrandNameAr').nullable();
        table.string('ProductType').nullable();
        table.string('Origin').nullable();
        table.string('PackagingType').nullable();
        table.string('unit').nullable();
        table.string('size').nullable();
        table.string('gpc').nullable();
        table.string('gpc_code').nullable();
        table.string('countrySale').nullable();
        table.string('HSCODES').nullable();
        table.text('HsDescription').nullable();
        table.string('gcp_type').nullable();
        table.string('prod_lang').nullable();
        table.string('ProvGLN').nullable();
        table.text('details_page', 'longtext').nullable();
        table.text('details_page_ar', 'longtext').nullable();
        table.string('product_url').nullable();
        table.string('purchase_price').nullable();
        table.string('selling_price').nullable();
        table.string('barcode').nullable();
        table.string('quantity').nullable();
        table.string('product_type').notNullable();
        table.string('front_image').nullable();
        table.string('back_image').nullable();
        table.string('image_1').nullable();
        table.string('image_2').nullable();
        table.string('image_3').nullable();
        table.integer('user_id').nullable();
        table.string('status').nullable().defaultTo('active');
        table.timestamps(true, true);
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTable('products');
}
