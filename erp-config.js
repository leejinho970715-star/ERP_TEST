// 기존 AX/DX와 같은 Supabase 프로젝트의 ERP 전용 함수입니다.
window.ERP_CONFIG = {
  endpoint: "https://uzvonfdifmbqdrsxzbcm.supabase.co/functions/v1/erp-consulting",
  publishableKey: "sb_publishable_CMvkqnGdR5LtouxgY7NdWA_NttFgWw5",
  productIcons: { wehago: "assets/product-wehago.png", amaranth: "assets/product-amaranth.png", omni: "assets/product-omni.png", oneai: "assets/product-oneai.png", pms: "" },
  productGuides: {
    wehago: [
      { href: "brochures/wehago-overview.pdf", label: "제품소개서 PDF 보기", meta: "65쪽 · 4.6 MB", page: 1 },
      { href: "brochures/wehago-services.pdf", label: "서비스 제안서 PDF 보기", meta: "61쪽 · 23 MB", page: 1 },
    ],
    amaranth: [{ href: "brochures/amaranth10.pdf", label: "제품소개서 PDF 보기", meta: "40쪽 · 6.4 MB", page: 1 }],
    omni: [{ href: "brochures/omniesol-oneai.pdf", label: "제품소개서 PDF 보기", meta: "OmniEsol·ONE AI 통합본 · 9쪽 · 18.8 MB", page: 1 }],
    oneai: [{ href: "brochures/omniesol-oneai.pdf", label: "ONE AI 소개 PDF 보기", meta: "OmniEsol·ONE AI 통합본 · ONE AI는 7쪽", page: 7 }],
  },
};
