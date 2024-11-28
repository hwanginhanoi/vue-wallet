<script setup lang="ts">
import Header from "../components/Header.vue";
import RemainingCard from "../components/RemainingCard.vue";
import IncomeCard from "../components/IncomeCard.vue";
import ExpensesCard from "../components/ExpensesCard.vue";
import LineChart from "../components/LineChart.vue";
import DonutChart from "../components/DonutChart.vue";
</script>

<template>
    <Header>
    </Header>
    <div class="w-full bg-gradient-to-t from-primary-500 via-primary-600 to-primary-700">
        <div class="mx-auto max-w-screen-xl p-8">
            <div class="grid grid-cols-1 gap-14 sm:grid-cols-1 lg:grid-cols-3">
                <RemainingCard>
                </RemainingCard>
                <IncomeCard>
                </IncomeCard>
                <ExpensesCard>
                </ExpensesCard>
            </div>
        </div>
    </div>
    <div class="w-full">
        <div class="mx-auto max-w-screen-xl p-8">
            <div class="grid grid-cols-1 gap-14 sm:grid-cols-1 lg:grid-cols-3">
            <LineChart>
            </LineChart>
            <DonutChart>
            </DonutChart>
        </div>
        </div>
    </div>
</template>