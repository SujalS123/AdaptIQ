from typing import List, Dict, Any

class KnapsackStudyOptimizer:
    """
    Optimizes a study plan using dynamic programming knapsack-like constraints.
    Helps students maximize score potential given a strict ceiling on weekly study hours.
    """
    def optimize_sessions(
        self,
        topics: List[Dict[str, Any]], # List of { "id": str, "name": str, "cost_hours": float, "benefit_points": float }
        max_weekly_hours: float
    ) -> List[Dict[str, Any]]:
        """
        0-1 Knapsack style optimization for exam topics selection when study time is limited.
        """
        # Convert hours to integer capacity for standard dynamic programming
        capacity = int(round(max_weekly_hours))
        if capacity <= 0 or not topics:
            return []

        n = len(topics)
        dp = [[0.0] * (capacity + 1) for _ in range(n + 1)]
        
        # DP table calculation
        for i in range(1, n + 1):
            t = topics[i - 1]
            cost = int(round(t.get("cost_hours", 2.0)))
            benefit = float(t.get("benefit_points", 1.0))
            
            for w in range(capacity + 1):
                if cost <= w:
                    dp[i][w] = max(dp[i-1][w], dp[i-1][w-cost] + benefit)
                else:
                    dp[i][w] = dp[i-1][w]
                    
        # Trace back to find selected items
        selected_topics = []
        w = capacity
        for i in range(n, 0, -1):
            if dp[i][w] != dp[i-1][w]:
                t = topics[i-1]
                selected_topics.append(t)
                cost = int(round(t.get("cost_hours", 2.0)))
                w -= cost

        return selected_topics
