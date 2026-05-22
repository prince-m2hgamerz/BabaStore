import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile } from "@/lib/auth/guards";
import { createR2PresignedPutUrl, isR2PresignReady } from "@/lib/storage/r2";
import { androidPackageSchema } from "@/lib/validators/developer";

const allowedFolders = new Set(["apks", "icons", "screenshots"] as const);

export async function POST(request: NextRequest) {
  const { profile, missingEnv } = await getCurrentProfile();

  if (missingEnv) {
    return NextResponse.json(
      { error: "Supabase environment variables are missing." },
      { status: 503 }
    );
  }

  if (!profile || !["developer", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isR2PresignReady()) {
    return NextResponse.json(
      { error: "Cloudflare R2 presigned upload environment variables are missing." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
    folder?: string;
    packageName?: string;
  };

  const parsedPackage = androidPackageSchema.safeParse(body.packageName ?? "");

  if (!parsedPackage.success) {
    return NextResponse.json(
      { error: parsedPackage.error.issues[0]?.message ?? "Invalid package name." },
      { status: 400 }
    );
  }

  if (!body.fileName || !body.contentType || !body.folder) {
    return NextResponse.json({ error: "Missing upload details." }, { status: 400 });
  }

  if (!allowedFolders.has(body.folder as "apks" | "icons" | "screenshots")) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  try {
    const upload = await createR2PresignedPutUrl({
      developerId: profile.id,
      fileName: body.fileName,
      contentType: body.contentType,
      folder: body.folder as "apks" | "icons" | "screenshots"
    });

    return NextResponse.json(upload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create upload URL." },
      { status: 500 }
    );
  }
}
