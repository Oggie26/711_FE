export const themeConfig = {
  token: {
    colorPrimary: '#008061', // 7-Eleven Green
    colorInfo: '#008061',
    colorSuccess: '#00a37c',
    colorWarning: '#ffb020',
    colorError: '#ef4444',
    colorTextBase: '#ffffff',
    borderRadius: 8,
    wireframe: false,
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 4px 20px rgba(0,0,0,0.05)',
    },
    Table: {
      headerBg: '#f9fafb',
      headerColor: '#4b5563',
      rowHoverBg: '#f4f7f6',
      borderRadiusLG: 12,
    },
    Menu: {
      itemBorderRadius: 8,
      itemMarginInline: 12,
    }
  }
};
