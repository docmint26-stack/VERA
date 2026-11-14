import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { getCredential, getPublicCredential } from "@/server/modules/verification/service";

// GET /api/v1/verification/credentials/:id - Get credential by ID
export const GET = apiRoute({
  auth: "optional",
  rateLimit: limits.publicRead,
  handler: async (ctx) => {
    // If authenticated, try to get full credential with ownership check
    if (ctx.user) {
      try {
        const credential = await getCredential(ctx.params.id);
        // Check if user is the subject or has verification privileges
        if (credential.subjectId === ctx.user.id) {
          return credential;
        }
      } catch {
        // Fall through to public credential
      }
    }
    // Return public credential view
    const credential = await getPublicCredential(ctx.params.id);
    return credential;
  },
});
