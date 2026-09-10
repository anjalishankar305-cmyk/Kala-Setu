from typing import Dict, Any
from datetime import datetime, timezone
from app.models import Product


class ONDCExporter:
    @staticmethod
    def to_beckn_and_schema_org(product: Product) -> Dict[str, Any]:
        """
        Converts product into:
        1. Beckn Retail Protocol (ONDC) Catalog Item representation
        2. Schema.org / Product JSON-LD representation
        """
        item_id = f"KALA-ITEM-{product.id:06d}"
        artisan_name = product.artisan.name if product.artisan else "Master Rural Artisan"
        pehchan_id = product.artisan.pehchan_id if product.artisan else "PEHCHAN-MOSJE-PENDING"
        state = product.artisan.state if product.artisan else "India"

        # Image URLs
        images = []
        if product.processed_image_path:
            images.append(product.processed_image_path)
        if product.raw_image_path:
            images.append(product.raw_image_path)
        if not images:
            images.append("/uploads/processed/placeholder_craft.jpg")

        now_utc = datetime.now(timezone.utc)

        # 1. Beckn Protocol (ONDC Retail Catalog v1.2.0)
        beckn_context = {
            "domain": "ONDC:RET10",  # Retail - Grocery/Handicrafts & Handlooms
            "country": "IND",
            "city": "std:080",
            "action": "on_search",
            "core_version": "1.2.0",
            "bap_id": "buyer-app.ondc.org",
            "bpp_id": "kalasetu.mosje.gov.in",
            "bpp_uri": "https://kalasetu.mosje.gov.in/bpp",
            "timestamp": now_utc.isoformat(),
            "ttl": "PT1H"
        }

        beckn_item = {
            "id": item_id,
            "parent_item_id": f"CRAFT-{product.craft_technique.replace(' ', '_').upper()}",
            "descriptor": {
                "name": product.title_en,
                "code": f"GI-{product.material[:3].upper()}-{product.id}",
                "symbol": images[0],
                "short_desc": product.description_en.split("\n")[0].replace("•", "").strip(),
                "long_desc": product.description_en,
                "images": images,
                "audio": product.audio_url or ""
            },
            "price": {
                "currency": "INR",
                "value": f"{product.final_price:.2f}",
                "minimum_value": f"{product.suggested_price:.2f}",
                "maximum_value": f"{product.final_price * 1.5:.2f}"
            },
            "category_id": "HANDLOOM_AND_HANDICRAFT",
            "fulfillment_id": "F1_DIRECT_DISPATCH",
            "location_id": f"LOC-{state.upper()}",
            "matched": True,
            "recommended": True,
            "tags": [
                {
                    "code": "statutory_reqs_packaged_commodities",
                    "list": [
                        {"code": "manufacturer_or_packer_name", "value": f"{artisan_name} ({pehchan_id})"},
                        {"code": "manufacturer_or_packer_address", "value": f"Artisan Cluster, {state}, India"},
                        {"code": "country_of_origin", "value": "IND"},
                        {"code": "common_or_generic_name_of_commodity", "value": product.craft_technique},
                        {"code": "net_quantity_or_measure_of_commodity_in_pkg", "value": "1 Piece"},
                        {"code": "month_year_of_manufacture_packing_import", "value": now_utc.strftime("%m/%Y")}
                    ]
                },
                {
                    "code": "artisan_verification",
                    "list": [
                        {"code": "pehchan_id", "value": pehchan_id},
                        {"code": "craft_technique", "value": product.craft_technique},
                        {"code": "material", "value": product.material},
                        {"code": "days_invested", "value": str(product.production_days)},
                        {"code": "fair_wage_guarantee", "value": "VERIFIED_MOSJE_COMPLIANT"},
                        {"code": "handloom_mark_compliance", "value": "TRUE"}
                    ]
                },
                {
                    "code": "bilingual_metadata",
                    "list": [
                        {"code": "title_hi", "value": product.title_hi},
                        {"code": "description_hi", "value": product.description_hi}
                    ]
                }
            ]
        }

        # 2. Schema.org / Product compliant JSON-LD
        schema_org = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.title_en,
            "alternateName": product.title_hi,
            "image": images,
            "description": product.description_en,
            "material": product.material,
            "countryOfOrigin": {
                "@type": "Country",
                "name": "India"
            },
            "brand": {
                "@type": "Brand",
                "name": f"KalaSetu Artisan ({artisan_name})"
            },
            "offers": {
                "@type": "Offer",
                "priceCurrency": "INR",
                "price": product.final_price,
                "availability": "https://schema.org/InStock",
                "priceValidUntil": "2027-12-31",
                "seller": {
                    "@type": "Person",
                    "name": artisan_name,
                    "identifier": pehchan_id
                }
            },
            "additionalProperty": [
                {
                    "@type": "PropertyValue",
                    "name": "Craft Technique",
                    "value": product.craft_technique
                },
                {
                    "@type": "PropertyValue",
                    "name": "Production Days",
                    "value": f"{product.production_days} Days"
                },
                {
                    "@type": "PropertyValue",
                    "name": "Fair Wage Floor (INR)",
                    "value": f"₹{product.suggested_price:,.2f}"
                }
            ]
        }

        return {
            "context": beckn_context,
            "message": {
                "catalog": {
                    "bpp/descriptor": {
                        "name": "KalaSetu Artisan MoSJE Direct Node",
                        "symbol": "/assets/kalasetu_logo.png",
                        "short_desc": "Direct fair-market linkage for marginalized rural craftspeople",
                        "long_desc": "Empowering GI & Handloom artisans with state-anchored minimum wages and transparent ONDC retail distribution."
                    },
                    "bpp/providers": [
                        {
                            "id": f"PROVIDER-{artisan_name.replace(' ', '_').upper()}",
                            "descriptor": {
                                "name": artisan_name,
                                "short_desc": f"Registered Artisan Card: {pehchan_id}"
                            },
                            "items": [beckn_item]
                        }
                    ]
                }
            },
            "schema_org": schema_org
        }
