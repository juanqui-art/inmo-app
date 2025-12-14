/**
 * TESTS - Upload Server Actions
 *
 * Tests for image upload functionality:
 * - File type validation (MIME types)
 * - File size limits (5MB max)
 * - Tier-based upload limits
 * - Presigned URL generation
 * - Public URL retrieval
 * - Error handling
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireRole } from "@/lib/auth";
import { canUploadImage } from "@/lib/permissions/property-limits";
import { createClient } from "@/lib/supabase/server";
import {
  generatePresignedUploadUrl,
  getPublicImageUrl,
} from "../upload";

// Get mocked functions
const mockRequireRole = vi.mocked(requireRole);
const mockCanUploadImage = vi.mocked(canUploadImage);
const mockCreateClient = vi.mocked(createClient);

// Test helpers
function createMockUser(overrides?: {
  id?: string;
  role?: "CLIENT" | "AGENT" | "ADMIN";
  subscriptionTier?: "FREE" | "PLUS" | "AGENT" | "PRO";
}) {
  return {
    id: overrides?.id || "user-123",
    email: "agent@example.com",
    role: overrides?.role || "AGENT",
    subscriptionTier: overrides?.subscriptionTier || "FREE",
    name: "Test Agent",
    phone: null,
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
  };
}

describe("Upload Server Actions", () => {
  // Mock Supabase client
  let mockSupabase: any;
  let mockCreateSignedUploadUrl: any;
  let mockGetPublicUrl: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock functions
    mockCreateSignedUploadUrl = vi.fn();
    mockGetPublicUrl = vi.fn();

    // Create mock Supabase storage client
    mockSupabase = {
      storage: {
        from: vi.fn(() => ({
          createSignedUploadUrl: mockCreateSignedUploadUrl,
          getPublicUrl: mockGetPublicUrl,
        })),
      },
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  describe("generatePresignedUploadUrl", () => {
    describe("File Type Validation", () => {
      it("should accept valid image types (jpeg)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-photo.jpg",
            token: "upload-token-123",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "photo.jpg",
          "image/jpeg",
          1024 * 1024 // 1MB
        );

        expect(result.success).toBe(true);
        expect(result.uploadUrl).toBe("https://storage.supabase.co/signed-url");
        expect(result.path).toBe("user-123/1234567890-photo.jpg");
        expect(result.token).toBe("upload-token-123");
      });

      it("should accept valid image types (png)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-image.png",
            token: "upload-token-456",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "image.png",
          "image/png",
          2 * 1024 * 1024 // 2MB
        );

        expect(result.success).toBe(true);
      });

      it("should accept valid image types (webp)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-photo.webp",
            token: "upload-token-789",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "photo.webp",
          "image/webp",
          1.5 * 1024 * 1024 // 1.5MB
        );

        expect(result.success).toBe(true);
      });

      it("should reject invalid file types (pdf)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);

        const result = await generatePresignedUploadUrl(
          "document.pdf",
          "application/pdf",
          1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("Tipo de archivo no permitido");
        expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      });

      it("should reject invalid file types (text)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);

        const result = await generatePresignedUploadUrl(
          "file.txt",
          "text/plain",
          1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("Tipo de archivo no permitido");
      });

      it("should reject invalid file types (video)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);

        const result = await generatePresignedUploadUrl(
          "video.mp4",
          "video/mp4",
          10 * 1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("Tipo de archivo no permitido");
      });
    });

    describe("File Size Validation", () => {
      it("should accept files under 5MB limit", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-large.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "large.jpg",
          "image/jpeg",
          4.9 * 1024 * 1024 // 4.9MB (under limit)
        );

        expect(result.success).toBe(true);
      });

      it("should accept files exactly at 5MB limit", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-max.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "max.jpg",
          "image/jpeg",
          5 * 1024 * 1024 // Exactly 5MB
        );

        expect(result.success).toBe(true);
      });

      it("should reject files over 5MB limit", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);

        const result = await generatePresignedUploadUrl(
          "huge.jpg",
          "image/jpeg",
          6 * 1024 * 1024 // 6MB (over limit)
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("demasiado grande");
        expect(result.error).toContain("5MB");
        expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      });

      it("should reject very large files (10MB)", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);

        const result = await generatePresignedUploadUrl(
          "massive.jpg",
          "image/jpeg",
          10 * 1024 * 1024 // 10MB
        );

        expect(result.success).toBe(false);
        expect(result.error).toContain("demasiado grande");
      });
    });

    describe("Tier-based Upload Limits", () => {
      it("should allow upload for FREE tier within limits", async () => {
        const mockUser = createMockUser({ subscriptionTier: "FREE" });
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({
          allowed: true,
          limit: 6,
        });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-free.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "free.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(true);
        expect(mockCanUploadImage).toHaveBeenCalledWith("FREE", 1);
      });

      it("should allow upload for PLUS tier within limits", async () => {
        const mockUser = createMockUser({ subscriptionTier: "PLUS" });
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({
          allowed: true,
          limit: 25,
        });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-plus.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "plus.jpg",
          "image/jpeg",
          2 * 1024 * 1024
        );

        expect(result.success).toBe(true);
        expect(mockCanUploadImage).toHaveBeenCalledWith("PLUS", 1);
      });

      it("should allow upload for AGENT tier within limits", async () => {
        const mockUser = createMockUser({ subscriptionTier: "AGENT" });
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({
          allowed: true,
          limit: 20,
        });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-agent.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "agent.jpg",
          "image/jpeg",
          3 * 1024 * 1024
        );

        expect(result.success).toBe(true);
        expect(mockCanUploadImage).toHaveBeenCalledWith("AGENT", 1);
      });

      it("should allow upload for PRO tier within limits", async () => {
        const mockUser = createMockUser({ subscriptionTier: "PRO" });
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({
          allowed: true,
          limit: 25,
        });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-pro.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "pro.jpg",
          "image/jpeg",
          4 * 1024 * 1024
        );

        expect(result.success).toBe(true);
        expect(mockCanUploadImage).toHaveBeenCalledWith("PRO", 1);
      });

      it("should reject upload when tier limit reached", async () => {
        const mockUser = createMockUser({ subscriptionTier: "FREE" });
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({
          allowed: false,
          reason: "Has alcanzado el límite de 6 imágenes para tu plan FREE",
          limit: 6,
        });

        const result = await generatePresignedUploadUrl(
          "overflow.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe(
          "Has alcanzado el límite de 6 imágenes para tu plan FREE"
        );
        expect(result.upgradeRequired).toBe(true);
        expect(result.currentLimit).toBe(6);
        expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      });
    });

    describe("File Name Sanitization", () => {
      it("should sanitize file names with special characters", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-my_photo_2025_.jpg", // Sanitized path
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "My Photo 2025!.jpg", // Spaces and special chars
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(true);
        // Verify sanitization occurred (path contains sanitized name)
        expect(result.path).toMatch(/user-123\/\d+-my_photo_2025_.jpg/);
      });

      it("should generate unique paths with timestamp", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-photo.jpg",
            token: "upload-token",
          },
          error: null,
        });

        const result = await generatePresignedUploadUrl(
          "photo.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(true);
        // Verify path includes userId and timestamp
        expect(result.path).toMatch(/^user-123\/\d+-photo\.jpg$/);
      });
    });

    describe("Supabase Integration", () => {
      it("should call Supabase createSignedUploadUrl with correct bucket", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-test.jpg",
            token: "upload-token",
          },
          error: null,
        });

        await generatePresignedUploadUrl("test.jpg", "image/jpeg", 1024 * 1024);

        expect(mockSupabase.storage.from).toHaveBeenCalledWith(
          "property-images"
        );
        expect(mockCreateSignedUploadUrl).toHaveBeenCalledWith(
          expect.stringMatching(/^user-123\/\d+-test\.jpg$/)
        );
      });

      it("should handle Supabase storage errors", async () => {
        const mockUser = createMockUser();
        mockRequireRole.mockResolvedValue(mockUser);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: null,
          error: { message: "Storage quota exceeded" },
        });

        const result = await generatePresignedUploadUrl(
          "photo.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe("Error al generar URL de carga");
      });
    });

    describe("Error Handling", () => {
      it("should handle unexpected errors gracefully", async () => {
        mockRequireRole.mockRejectedValue(new Error("Database connection failed"));

        const result = await generatePresignedUploadUrl(
          "photo.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe("Database connection failed");
      });

      it("should handle non-Error exceptions", async () => {
        mockRequireRole.mockRejectedValue("String error");

        const result = await generatePresignedUploadUrl(
          "photo.jpg",
          "image/jpeg",
          1024 * 1024
        );

        expect(result.success).toBe(false);
        expect(result.error).toBe("Error interno del servidor");
      });
    });

    describe("Authentication", () => {
      it("should require AGENT or ADMIN role", async () => {
        const mockAgent = createMockUser({ role: "AGENT" });
        mockRequireRole.mockResolvedValue(mockAgent);
        mockCanUploadImage.mockReturnValue({ allowed: true, limit: 6 });

        mockCreateSignedUploadUrl.mockResolvedValue({
          data: {
            signedUrl: "https://storage.supabase.co/signed-url",
            path: "user-123/1234567890-photo.jpg",
            token: "upload-token",
          },
          error: null,
        });

        await generatePresignedUploadUrl("photo.jpg", "image/jpeg", 1024 * 1024);

        expect(mockRequireRole).toHaveBeenCalledWith(["AGENT", "ADMIN"]);
      });
    });
  });

  describe("getPublicImageUrl", () => {
    it("should return public URL for given path", async () => {
      mockGetPublicUrl.mockReturnValue({
        data: {
          publicUrl:
            "https://storage.supabase.co/object/public/property-images/user-123/photo.jpg",
        },
      });

      const result = await getPublicImageUrl("user-123/photo.jpg");

      expect(result.success).toBe(true);
      expect(result.publicUrl).toBe(
        "https://storage.supabase.co/object/public/property-images/user-123/photo.jpg"
      );
      expect(mockSupabase.storage.from).toHaveBeenCalledWith("property-images");
    });

    it("should handle errors gracefully", async () => {
      mockCreateClient.mockRejectedValue(new Error("Connection failed"));

      const result = await getPublicImageUrl("user-123/photo.jpg");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al obtener URL pública");
    });
  });
});
