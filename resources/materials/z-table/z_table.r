box::use(
    knitr[is_html_output], 
    kableExtra[
        kable, kable_styling, column_spec, row_spec, scroll_box 
    ], 
    stats[pnorm]
)

generate_z_table = function(z_range, by = 0.1) {
    z_first = seq(z_range[1], z_range[2], by = by)
    z_second = seq(0, 0.09, by = 0.01)
    
    if (z_range[1] < 0) {
        z_second = seq(-0.09, 0, by = 0.01)
    }
    
    z_matrix = matrix(nrow = length(z_first), ncol = length(z_second))
    rownames(z_matrix) = sprintf("%.1f", z_first)
    colnames(z_matrix) = sprintf(".%02.0f", abs(z_second) * 100)
    
    for (i in seq_along(z_first)) {
        for (j in seq_along(z_second)) {
            z_value = z_first[i] + z_second[j]
            z_matrix[i, j] = pnorm(z_value)
        }
    }
    
    z_matrix
}

format_z_table_html = function(z_matrix, caption, header_color = "#4a90e2") {
    z_df = as.data.frame(z_matrix)
    z_df = cbind(Z = rownames(z_matrix), z_df)
    rownames(z_df) = NULL
    
    kable(z_df, digits = 4, align = "c", caption = caption) |>
        kable_styling(
            bootstrap_options = c("striped", "hover", "condensed"),
            full_width = FALSE,
            font_size = 11,
            fixed_thead = TRUE
        ) |>
        column_spec(1, bold = TRUE, background = "#f0f0f0") |>
        row_spec(0, bold = TRUE, background = header_color, color = "white") |>
        scroll_box(width = "100%", height = "600px")
}

format_z_table_pdf = function(z_matrix, caption) {
    z_df = as.data.frame(z_matrix)
    z_df = cbind(Z = rownames(z_matrix), z_df)
    rownames(z_df) = NULL
    
    kable(
        z_df, 
        format = "latex", 
        digits = 4, 
        align = "c",
        caption = caption,
        booktabs = TRUE, 
        linesep = ""
    ) |>
        kable_styling(
            latex_options = c("scale_down", "HOLD_position"),
            font_size = 8
        ) |>
        row_spec(0, bold = TRUE)
}

create_z_table = function(z_range, caption, header_color = "#4a90e2") {
    z_matrix = generate_z_table(z_range)
    
    if (is_html_output()) {
        format_z_table_html(z_matrix, caption, header_color)
    } else {
        format_z_table_pdf(z_matrix, caption)
    }
}
