import { supabase } from "@/lib/supabase";

// ===== PRODUCT RATINGS (ADMIN) =====
export async function fetchProductRatingsSummary({
  adminId,
  productId = null,
}) {
  const { data, error } = await supabase.rpc("get_ratings_summary", {
    p_product_id: productId,
    p_coop_id: adminId,
  });
  if (error) throw error;
  return (
    data?.[0] || {
      avg_rating: 0,
      total_ratings: 0,
      star_5: 0,
      star_4: 0,
      star_3: 0,
      star_2: 0,
      star_1: 0,
    }
  );
}

export async function fetchProductRatingsFeedAdmin({
  adminId,
  productId = null,
}) {
  const { data, error } = await supabase.rpc("get_ratings_feed_admin", {
    p_product_id: productId,
    p_coop_id: adminId,
  });
  if (error) throw error;
  return data || [];
}

// ===== SERVICE RATINGS (ADMIN) =====
export async function fetchServiceRatingsSummary({
  adminId,
  productId = null,
}) {
  const { data, error } = await supabase.rpc("get_service_ratings_summary", {
    p_product_id: productId,
    p_coop_id: adminId,
  });
  if (error) throw error;
  return (
    data?.[0] || {
      avg_rating: 0,
      total_ratings: 0,
      star_5: 0,
      star_4: 0,
      star_3: 0,
      star_2: 0,
      star_1: 0,
    }
  );
}

export async function fetchServiceReviewsAdmin({ adminId, productId = null }) {
  const { data, error } = await supabase.rpc("get_service_reviews_admin", {
    p_product_id: productId,
    p_coop_id: adminId,
  });
  if (error) throw error;
  return data || [];
}
