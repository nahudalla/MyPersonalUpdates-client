define(()=>[
    {
        path: /^(?:index)?$/,
        uses: "app",
        requiresAuthentication: true
    },
    {
        path: /^login$/,
        uses: "login-dialog"
    },
    {
        path: /^signup$/,
        uses: "signup-dialog"
    },
    {
        path: /./,
        uses: "e404-dialog"
    }
]);