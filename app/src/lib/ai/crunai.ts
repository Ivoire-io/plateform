// ─── crun.ai Provider — Logo Generation ───
// Utilisé pour la génération de logos via nanobanana pro
// API : crun.ai

const CRUN_API_BASE = "https://api.crun.ai/api/v1/client/job";

function getCrunHeaders(): Record<string, string> {
  return {
    "x-api-key": process.env.CRUN_API_KEY || "",
    "Content-Type": "application/json",
  };
}

// ─── Création d'une tâche de génération de logo ───
export async function createLogoTask(
  prompt: string
): Promise<{ taskId: string }> {
  const response = await fetch(`${CRUN_API_BASE}/CreateTask`, {
    method: "POST",
    headers: getCrunHeaders(),
    body: JSON.stringify({
      model: "google/nano-banana-pro",
      input: {
        prompt,
        resolution: "1K",
        output_format: "png",
        aspect_ratio: "1:1",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `crun.ai API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.code !== 200 || !data.data?.task_id) {
    throw new Error(
      `crun.ai task creation failed: ${JSON.stringify(data)}`
    );
  }

  return { taskId: data.data.task_id };
}

// ─── Vérification du statut d'une tâche ───
export async function getTaskStatus(
  taskId: string
): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  imageUrl?: string;
}> {
  const response = await fetch(
    `${CRUN_API_BASE}/GetTaskInfo?task_id=${encodeURIComponent(taskId)}`,
    {
      method: "GET",
      headers: getCrunHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(
      `crun.ai API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Map crun.ai status to our normalized status
  const status = data.data?.status ?? "pending";
  const imageUrl = data.data?.image_url ?? data.data?.output?.image_url;

  if (status === "completed" || status === "done" || status === "success") {
    return { status: "completed", imageUrl };
  }
  if (status === "failed" || status === "error") {
    return { status: "failed" };
  }
  if (status === "processing" || status === "running") {
    return { status: "processing" };
  }
  return { status: "pending" };
}

// ─── Génération de 3 propositions de logos ───
export async function generateLogos(
  projectName: string,
  sector: string,
  country: string,
  style?: string,
  colors?: string
): Promise<Array<{ taskId: string; variation: string }>> {
  const styleHint = style ? ` Style preference: ${style}.` : "";
  const colorHint = colors ? ` Color palette: ${colors}.` : "";

  const prompts = [
    {
      variation: "minimal",
      prompt: `Create a professional, modern logo for a startup named '${projectName}' in the ${sector} sector targeting ${country}. Style: minimal and clean. Transparent background, icon-based.${styleHint}${colorHint}`,
    },
    {
      variation: "geometric",
      prompt: `Design a bold, distinctive logo mark for '${projectName}', a ${sector} startup from ${country}. Style: geometric and tech-forward. Transparent background.${styleHint}${colorHint}`,
    },
    {
      variation: "wordmark",
      prompt: `Create an elegant, memorable wordmark logo for '${projectName}', a ${sector} company in ${country}. Style: typographic with subtle icon. Transparent background.${styleHint}${colorHint}`,
    },
  ];

  const results = await Promise.all(
    prompts.map(async ({ prompt, variation }) => {
      const { taskId } = await createLogoTask(prompt);
      return { taskId, variation };
    })
  );

  return results;
}
