module bab::Core {
    // Sui Move Library
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::display;
    use sui::object::{Self, UID, ID};
    use sui::event;
    use sui::url::{Self, Url, inner_url};
    use sui::address;
    use sui::package;

    use sui::{balance::{Self, Balance}, coin::{Self, Coin}, sui::SUI};

    // Standard Move Library
    use std::string::{Self, String, utf8, bytes, from_ascii, to_ascii};
    // use std::ascii;
    // use std::option;
    use std::type_name;
    // use std::vector;



    const EUnauthorized: u64 = 1000;
    const EInsufficientBalance: u64 = 1001;



    struct ComposableModule has key, store {
        id: UID,
        creator_name: String,
        creator: address,

        name: String,
        type: String,  // "character", "knowledge", "memory", "speech", "tone"
        description: String,

        url: Url,
        thumbnail_url: Url,

        is_purchasable: bool,
        price: u64,

        // TODO: change this into Option<Blob>
        walrus_certificate: address  // The on-chain Walrus object ID that contians the DA certificate
    }

    struct ComposableModuleInstance has key, store {
        id: UID,

        creator_name: String,

        name: String,
        type: String,  // "character", "knowledge", "memory", "speech", "tone"
        module_id: address,  // The Object ID of the ComposableModule factory object
        description: String,

        url: Url,
        thumbnail_url: Url,

        walrus_certificate: address
    }



    struct ComposableModulePublishedEvent has copy, drop {
        module_id: ID,
        type: String,
        creator: address
    }

    struct ComposableModuleInstanceCreatedEvent has copy, drop {
        module_id: ID,
        type: String,
        recipient: address
    }

    
    
    struct CORE has drop { }  // OTW

    fun init(otw: CORE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx); // Publisher object

        let display_keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"thumbnail_url"),
            utf8(b"description"),
            utf8(b"creator"),
        ];

        let display_vals = vector[
            utf8(b"{name} ({type} Module)"),
            utf8(b"{url}"),
            utf8(b"{thumbnail_url}"),
            utf8(b"{description}"),
            utf8(b"{creator_name} ({creator})"),
        ];

        let display = display::new_with_fields<ComposableModule>(&publisher, display_keys, display_vals, ctx);
        display::update_version(&mut display);
        transfer::public_transfer(display, tx_context::sender(ctx));

        let instance_display_keys = vector[
            utf8(b"name"),
            utf8(b"image_url"),
            utf8(b"thumbnail_url"),
            utf8(b"description"),
            utf8(b"creator"),
        ];

        let instance_display_vals = vector[
            utf8(b"{name} ({type} Module Instance)"),
            utf8(b"{url}"),
            utf8(b"{thumbnail_url}"),
            utf8(b"{description}"),
            utf8(b"{creator_name} ({creator})"),
        ];

        let instance_display = display::new_with_fields<ComposableModuleInstance>(&publisher, instance_display_keys, instance_display_vals, ctx);
        display::update_version(&mut instance_display);
        transfer::public_transfer(instance_display, tx_context::sender(ctx));

        transfer::public_transfer(publisher, tx_context::sender(ctx));
    }
    
    public fun publish_module(
        name: String,
        type: String,
        image_url: String,
        thumbnail_url: String,
        description: String,
        creator_name: String,

        ctx: &mut TxContext
    ) : ID {
        let sender: address = tx_context::sender(ctx);
        let new_module: ComposableModule = mint_module_object(name, type, image_url, thumbnail_url, description, creator_name, ctx);


        let module_id: ID = object::id(&new_module);
        
        let module_instance: ComposableModuleInstance = mint_module_instance_object(&new_module, ctx);
        
        // TODO: maybe not needed
        transfer::public_transfer(module_instance, sender);  // Send a copy of the new module instance to the creator
        

        transfer::public_share_object(new_module);
        module_id
    }

    fun mint_module_object (
        name: String,
        type: String,
        image_url: String,
        thumbnail_url: String,
        description: String,
        creator_name: String,

        ctx: &mut TxContext
    ): ComposableModule {
        let sender: address = tx_context::sender(ctx);

        let module_uid: UID = object::new(ctx);
        let new_module: ComposableModule = ComposableModule {
            id: module_uid,
            creator_name: creator_name,
            creator: sender,

            name: name,
            type: type,
            description: description,

            url: url::new_unsafe(to_ascii(image_url)),
            thumbnail_url: url::new_unsafe(to_ascii(thumbnail_url)),

            is_purchasable: false,
            price: 0,

            walrus_certificate: sender
        };

        // Broadcast the module instance creation event
        event::emit(
            ComposableModulePublishedEvent {
                module_id: object::id(&new_module),
                type: type,
                creator: sender
            }
        );

        new_module
    }

    public fun mint_module_instance_object (
        composable_module: &ComposableModule,
        ctx: &mut TxContext
    ) : ComposableModuleInstance {
        let module_instance_uid: UID = object::new(ctx);
        let new_module_instance: ComposableModuleInstance = ComposableModuleInstance {
            id: module_instance_uid,
            creator_name: composable_module.creator_name,

            name: composable_module.name,
            type: composable_module.type,
            module_id: object::id_address(composable_module),
            description: composable_module.description,

            url: composable_module.url,
            thumbnail_url: composable_module.thumbnail_url,

            walrus_certificate: composable_module.walrus_certificate
        };

        new_module_instance
    }

    public fun update_module_marketplace_listing (
        composable_module: &mut ComposableModule,
        is_purchasable: bool,
        price: u64,
        
        ctx: &mut TxContext
    ) {
        let sender: address = tx_context::sender(ctx);

        assert!(composable_module.creator == sender, EUnauthorized);  // Only the module creator can update listing policies

        composable_module.is_purchasable = is_purchasable;
        composable_module.price = price;
    }


    public fun purchase_module (
        composable_module: &ComposableModule,
        sui: &mut Coin<SUI>,

        ctx: &mut TxContext
    ) {
        let sender: address = tx_context::sender(ctx);

        // Module creator can mint the module instance for free
        if (sender != composable_module.creator) {
            assert!(coin::value(sui) >= composable_module.price, EInsufficientBalance);

            let fee: Coin<SUI> = coin::split(sui, composable_module.price, ctx);
            sui::transfer::public_transfer(fee, composable_module.creator);
        }; 

        let module_instance = mint_module_instance_object(composable_module, ctx);
        transfer::public_transfer(module_instance, sender);
    }

    public fun update_module_walrus_certificate (
        composable_module: &mut ComposableModule,
        walrus_certificate: address,
        
        ctx: &mut TxContext
    ) {
        let sender: address = tx_context::sender(ctx);

        assert!(composable_module.creator == sender, EUnauthorized);  // Only the module creator can update the certificate

        composable_module.walrus_certificate = walrus_certificate;
    }
}