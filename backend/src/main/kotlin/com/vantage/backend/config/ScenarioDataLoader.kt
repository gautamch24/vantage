package com.vantage.backend.config

import com.vantage.backend.model.Scenario
import com.vantage.backend.repository.ScenarioRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class ScenarioDataLoader(private val scenarioRepository: ScenarioRepository) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (scenarioRepository.count() > 0) return // already seeded

        val scenarios = listOf(
            Scenario(
                name = "2008 Financial Crisis",
                description = "The worst financial crisis since the Great Depression, triggered by the collapse of the US housing market and complex mortgage-backed securities.",
                startDate = LocalDate.of(2007, 10, 1),
                endDate = LocalDate.of(2009, 3, 31),
                crisisSummary = "The 2008 Financial Crisis was triggered by the collapse of the US housing bubble and the failure of mortgage-backed securities. Lehman Brothers filed for bankruptcy in September 2008, causing a global credit freeze. Banks stopped lending to each other, the stock market lost nearly 50% of its value, and unemployment surged to 10%. The S&P 500 fell from a peak of 1565 in October 2007 to a trough of 676 in March 2009 — a 57% collapse."
            ),
            Scenario(
                name = "COVID-19 Crash",
                description = "The fastest 30% market decline in history as COVID-19 became a global pandemic, triggering economic shutdowns worldwide.",
                startDate = LocalDate.of(2020, 2, 1),
                endDate = LocalDate.of(2020, 4, 30),
                crisisSummary = "The COVID-19 crash was the fastest bear market in history. In just 33 days, the S&P 500 fell over 34% as the pandemic forced global economic shutdowns. Travel, hospitality, and energy sectors were devastated. The Federal Reserve responded with emergency rate cuts to near zero and unprecedented quantitative easing. While the decline was extreme, the recovery was also historically fast — the market reached new highs by August 2020."
            ),
            Scenario(
                name = "Dot-com Bubble Burst",
                description = "The collapse of technology stock valuations after the speculative bubble of the late 1990s. The NASDAQ fell 78% over 2.5 years.",
                startDate = LocalDate.of(2000, 3, 1),
                endDate = LocalDate.of(2002, 10, 31),
                crisisSummary = "The dot-com bubble burst after years of speculative investment in internet companies with no earnings. At its peak, the NASDAQ traded at 200x earnings. When the bubble popped in March 2000, technology stocks collapsed catastrophically. The NASDAQ fell 78% over 31 months. Companies like Pets.com, Webvan, and hundreds of others went bankrupt. Even Amazon lost 90% of its value. The S&P 500 lost 49% peak-to-trough."
            ),
            Scenario(
                name = "2022 Rate Shock",
                description = "The Federal Reserve's most aggressive rate hiking cycle in 40 years, triggered by 9% inflation. Growth stocks and bonds both collapsed simultaneously.",
                startDate = LocalDate.of(2022, 1, 1),
                endDate = LocalDate.of(2022, 10, 31),
                crisisSummary = "In 2022, the Federal Reserve raised interest rates from near zero to over 4% in less than a year — the most aggressive tightening cycle since the 1980s. This was unprecedented because it caused both stocks AND bonds to fall simultaneously, destroying the traditional 60/40 portfolio. Growth stocks (high-multiple tech) were especially devastated as rising rates made future earnings less valuable. The NASDAQ fell 33%, and long-duration bonds lost over 25%."
            ),
            Scenario(
                name = "Global Financial Crisis Aftermath",
                description = "The post-2008 recovery period and European debt crisis, testing how portfolios performed through the prolonged deleveraging cycle.",
                startDate = LocalDate.of(2010, 1, 1),
                endDate = LocalDate.of(2011, 12, 31),
                crisisSummary = "The 2010–2011 period saw markets grappling with the European sovereign debt crisis (Greece, Ireland, Portugal), the US debt ceiling standoff, and the S&P downgrade of US credit from AAA. While the worst of the 2008 crash was over, portfolios faced renewed volatility as contagion fears spread from European banks. The S&P 500 dropped 19% in the summer of 2011 alone. This scenario tests how a portfolio handles a prolonged, multi-shock environment rather than a single acute crash."
            )
        )

        scenarioRepository.saveAll(scenarios)
    }
}
