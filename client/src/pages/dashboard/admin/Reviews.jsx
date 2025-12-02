import React, { useEffect, useMemo, useState } from "react";
import {
  fetchProductRatingsSummary,
  fetchProductRatingsFeedAdmin,
  fetchServiceRatingsSummary,
  fetchServiceReviewsAdmin,
} from "@/services/Ratings";
import { supabase } from "@/lib/supabase";

/* ====================== Helpers ====================== */

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

// Build a  map from review array
function calcStarCountsFromReviews(reviews, field = "rating") {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const val = Number(r[field]);
    if (val >= 1 && val <= 5) counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

/* ====================== UI Pieces ====================== */

// SummaryCard
// - Small card used in the top row
// - Shows metrics like avg rating / total reviews
function SummaryCard({ label, value, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm px-5 py-4 flex flex-col justify-between">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold mt-1 text-yellow-500">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// RatingBarsCard
// - Shows 5–1 star breakdown using horizontal bars
// - Uses the (already filtered) review list so it reacts to filters

function RatingBarsCard({ title, reviews, ratingField }) {
  const total = reviews.length || 0;
  const base = total || 1;
  const starCounts = calcStarCountsFromReviews(reviews, ratingField);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="font-semibold mb-4">{title}</p>

      {[5, 4, 3, 2, 1].map((star) => {
        const count = starCounts[star] || 0;
        const width = (count / base) * 100;

        return (
          <div
            key={star}
            className="flex items-center gap-2 text-sm mb-2"
          >
            <span className="w-4 text-right text-gray-500">{star}</span>
            <div className="flex-1 bg-gray-200 h-2 rounded-full">
              <div
                className="h-2 rounded-full bg-yellow-400"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-6 text-right text-gray-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ReviewCard
// - One row in the review list
// - Left: buyer avatar + product/service info
// - Right: stars, date, and comment

function ReviewCard({ review }) {
  const {
    buyer_img,
    buyer_name,
    rating,
    created_at,
    comment,
    product_name,
    service_name,
    size,
    tray_qty,
  } = review;

  const isProduct = !!product_name;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col md:flex-row gap-5">
      {/* LEFT SIDE: avatar + basic info */}
      <div className="flex-shrink-0 flex items-start gap-3 md:w-1/3">
        <img
          src={buyer_img}
          alt={buyer_name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-normal text-gray-700">{buyer_name}</p>

          <div className="text-xs text-gray-500 space-y-0.5 mt-1">
            {isProduct ? (
              <>
                <p className="font-medium text-yellow-600">
                  Product: {product_name}
                </p>
                {size && <p>Size: {size}</p>}
                {typeof tray_qty === "number" && (
                  <p>Trays Ordered: {tray_qty}</p>
                )}
              </>
            ) : (
              <p className="font-medium text-yellow-600">
                Service: {service_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: stars, date, comment */}
      <div className="flex-1 md:w-2/3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center text-yellow-400 text-sm">
            {Array.from({ length: rating || 0 }).map((_, idx) => (
              <span key={idx}>★</span>
            ))}
            {Array.from({ length: 5 - (rating || 0) }).map((_, idx) => (
              <span key={idx} className="text-gray-300">
                ★
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400">{created_at}</p>
        </div>

        <p className="text-sm text-gray-700 mb-2">{comment}</p>
      </div>
    </div>
  );
}

/* ====================== Main Page ====================== */

export default function AdminReviewPage() {

  const [activeTab, setActiveTab] = useState("product"); // "product" | "service"
  const [productSummary, setProductSummary] = useState(null);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [starFilter, setStarFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");

  const [adminId, setAdminId] = useState(null);  // Auth 
  const [loading, setLoading] = useState(false);

  /* ---- 1) Get current logged-in admin */
  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("[AdminReviewPage] getUser error", error);
        return;
      }
      setAdminId(data?.user?.id || null);
    }

    loadUser();
  }, []);

  /* ---- 2) load all ratings data ---- */
  useEffect(() => {
    if (!adminId) return;

    async function loadInitial() {
      setLoading(true);
      try {
        const [prodSum, prodFeed, servSum, servFeed] = await Promise.all([
          fetchProductRatingsSummary({ adminId }),
          fetchProductRatingsFeedAdmin({ adminId }),
          fetchServiceRatingsSummary({ adminId }),
          fetchServiceReviewsAdmin({ adminId }),
        ]);

        setProductSummary(prodSum);
        setProductReviews(prodFeed || []);
        setServiceSummary(servSum);
        setServiceReviews(servFeed || []);
      } catch (err) {
        console.error("[AdminReviewPage] loadInitial error", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, [adminId]);


  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStarFilter("");
    setSizeFilter("");
  };

  // Filtered product reviews based on date, stars, and size
  const filteredProductReviews = useMemo(
    () =>
      productReviews.filter((r) => {
        const date = r.created_at ? r.created_at.slice(0, 10) : "";
        const matchFrom = fromDate ? date >= fromDate : true;
        const matchTo = toDate ? date <= toDate : true;
        const matchStar = starFilter ? r.rating === Number(starFilter) : true;
        const matchSize = sizeFilter ? r.size_label === sizeFilter : true;
        return matchFrom && matchTo && matchStar && matchSize;
      }),
    [productReviews, fromDate, toDate, starFilter, sizeFilter]
  );

  // Filtered service reviews based on date + stars
  const filteredServiceReviews = useMemo(
    () =>
      serviceReviews.filter((r) => {
        const date = r.created_at ? r.created_at.slice(0, 10) : "";
        const matchFrom = fromDate ? date >= fromDate : true;
        const matchTo = toDate ? date <= toDate : true;
        const matchStar = starFilter
          ? r.service_rating === Number(starFilter)
          : true;
        return matchFrom && matchTo && matchStar;
      }),
    [serviceReviews, fromDate, toDate, starFilter]
  );

  const currentReviews =
    activeTab === "product" ? filteredProductReviews : filteredServiceReviews;

  // Values for cards (from summary RPCs)
  const productAvg = productSummary?.avg_rating ?? 0;
  const productTotal = productSummary?.total_ratings ?? 0;
  const serviceAvg = serviceSummary?.avg_rating ?? 0;
  const serviceTotal = serviceSummary?.total_ratings ?? 0;

  return (
    <div className="min-h-screen px-6 py-6 bg-gray-50">
      {/* ===== TOP 4 SUMMARY CARDS (overall stats) ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Product - Average Rating"
          value={`${productAvg} ★`}
          subtitle="Average rating for product reviews"
        />
        <SummaryCard
          label="Product - Total Reviews"
          value={formatNumber(productTotal)}
          subtitle="Total product reviews"
        />
        <SummaryCard
          label="Service - Average Rating"
          value={`${serviceAvg} ★`}
          subtitle="Average rating for service reviews"
        />
        <SummaryCard
          label="Service - Total Reviews"
          value={formatNumber(serviceTotal)}
          subtitle="Total service reviews"
        />
      </div>

      {/* ===== MAIN CONTENT: LEFT (bars) + RIGHT (filters + list) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN – star breakdown cards */}
        <div className="space-y-4">
          <RatingBarsCard
            title="Product Ratings Breakdown"
            reviews={filteredProductReviews}
            ratingField="rating"
          />
          <RatingBarsCard
            title="Service Ratings Breakdown"
            reviews={filteredServiceReviews}
            ratingField="service_rating"
          />
        </div>

        {/* RIGHT COLUMN – tabs, filters, and review list */}
        <div className="lg:col-span-2 space-y-4">
          {/* TABS + FILTERS */}
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Segmented Tabs (Product / Service) */}
            <div className="inline-flex bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setActiveTab("product")}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  activeTab === "product"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Product
              </button>
              <button
                onClick={() => setActiveTab("service")}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  activeTab === "service"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500"
                }`}
              >
                Service
              </button>
            </div>

            {/* Filters (date range, stars, product size) */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div>
                <label className="block text-xs text-gray-500">From</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1 px-3 py-1.5 rounded-md bg-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">To</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 px-3 py-1.5 rounded-md bg-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">Stars</label>
                <select
                  value={starFilter}
                  onChange={(e) => setStarFilter(e.target.value)}
                  className="mt-1 px-3 py-1.5 rounded-md bg-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} Stars
                    </option>
                  ))}
                </select>
              </div>

              {activeTab === "product" && (
                <div>
                  <label className="block text-xs text-gray-500">
                    Product Size
                  </label>
                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="mt-1 px-3 py-1.5 rounded-md bg-gray-200 border-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="">All</option>
                    <option value="Peewee">Peewee</option>
                    <option value="Pullets">Pullets</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Extra-Large">XLarge</option>
                    <option value="Jumbo">Jumbo</option>
                  </select>
                </div>
              )}

              <button
                onClick={resetFilters}
                className="self-end mt-1 px-3 py-1.5 rounded-md border border-gray-400 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                Reset All
              </button>
            </div>
          </div>

          {/* REVIEW LIST */}
          <div className="space-y-3">
            {loading && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500 text-sm">
                Loading reviews…
              </div>
            )}

            {!loading && currentReviews.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500 text-sm">
                No reviews found for this selection.
              </div>
            )}

            {!loading &&
              currentReviews.map((r) => (
                <ReviewCard
                  key={r.review_id}
                  review={{
                    buyer_img: r.profile_img,
                    buyer_name: r.masked_name,
                    rating:
                      activeTab === "product" ? r.rating : r.service_rating,
                    created_at: r.created_at
                      ? r.created_at.slice(0, 10)
                      : "",
                    comment:
                      activeTab === "product"
                        ? r.comment
                        : r.service_comment,
                    product_name:
                      activeTab === "product" ? r.product_name : null,
                    service_name:
                      activeTab === "service" ? "Service Feedback" : null,
                    size: activeTab === "product" ? r.size_label : null,
                    tray_qty: activeTab === "product" ? r.tray_qty : null,
                  }}
                />
              ))}
          </div>
        </div>
      </div>

      {/* 
        Cards quick summary:
        - SummaryCard: top KPI tiles (avg + totals, product & service)
        - RatingBarsCard: left column star breakdown for product/service
        - ReviewCard: main review rows (profile + rating + comment + product/service info)
      */}
    </div>
  );
}
