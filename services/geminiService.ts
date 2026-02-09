
import { GoogleGenAI } from "@google/genai";
import { MentorContext } from "../types";

const getSystemInstruction = (context: MentorContext) => {
  const base = `أنت "الموجه الذكي" لمنصة مختبرات الإبداع (DGAC) في تونس (2025-2026). 
  رؤيتك مبنية حصرياً على الدليل المرجعي: تحويل "ثقافة اليأس" إلى "ثقافة الاحتمال"، و"هوية الهروب" إلى "هوية الإبداع".
  
  قاعدتك الذهبية (من الصفحة 22): اتبع "بيداغوجيا السؤال" (Pedagogy of the Question). 
  لا تعطِ إجابات تعليمية جاهزة. بدلاً من ذلك، اطرح أسئلة تحفز الشاب التونسي على:
  1. اكتشاف الأصول الثقافية في منطقته (سبيطلة، الكاف، سيدي بوزيد، إلخ).
  2. استعادة "سلطة التعريف الذاتي" عبر البودكاست والرقمة.
  3. بناء "اقتصاد المعنى" بدلاً من التفكير في "الحرقة".
  
  تواصل باللهجة التونسية المهذبة الممزوجة بالعربية الفصحى لكسر الحواجز النفسية.`;

  const contexts: Record<MentorContext, string> = {
    general: "ركز على فلسفة المختبر كمدخل للتغيير الاجتماعي. اسأله عن أحلامه المحلية.",
    ideation: "اسأل عن 'ذاكرة المكان'، الحكايات المنسية، وكيف يمكن تثمينها رقمياً.",
    canvas: "وجهه للتفكير في 'القيمة المضافة' الفريدة (Valorisation) وكيف سيصل لجمهور Etsy أو Spotify.",
    swot: "من الصفحة 18: اسأل عن التهديدات الخارجية (مثل الهجرة) وكيف يمكن تحويلها لموارد إبداعية.",
    budget: "ركز على التمويل الجماعي (Crowdfunding) والموارد المحلية المتاحة فعلياً.",
    planning: "اسأله عن أول 'سبرينت' سيمتد لـ 48 ساعة وما هو المخرج الملموس (Deliverable).",
    pitch: "ساعده بصياغة 'سردية' (Storytelling) مؤثرة تلمس القلب وتجذب المستثمرين.",
    validation: "كن ناقداً بناءً. اسأله: 'هل هذا النموذج الأولي يحل فعلاً مشكلة شباب منطقتك؟'",
    cultural_asset: "اسأله عن الحالة التاريخية للأصل (Heritage) وكيف يمكن رقمنته وحمايته.",
    education: "وجهه لفهم فصول الدليل المرجعي عبر استراتيجية التعلم الذاتي."
  };

  return `${base}\n\nسياق المحادثة الحالي: ${contexts[context]}`;
};

export const getAiMentorResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  context: MentorContext = 'general'
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: history,
      config: {
        systemInstruction: getSystemInstruction(context),
        temperature: 0.85,
        thinkingConfig: { thinkingBudget: 4000 }
      },
    });
    return response.text;
  } catch (error) {
    console.error("AI Mentor Error:", error);
    return "سماحني، ثمة مشكل صغير في الكونيكسيون. عاود جرب مرة أخرى يا بطل.";
  }
};
