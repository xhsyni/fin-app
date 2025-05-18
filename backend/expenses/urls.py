from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import addExpense,viewAllExpenses,editExpenses,deleteExpenses,extractFile

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('api/', include(router.urls)),
    path('api/expenses/addExpenses', addExpense, name='addExpenses'),
    path('api/expenses/viewAllExpenses', viewAllExpenses, name='viewAllExpenses'),
    path('api/expenses/editExpenses', editExpenses, name='editExpenses'),
    path('api/expenses/deleteExpenses', deleteExpenses, name='deleteExpenses'),
    path('api/expenses/extractFile',extractFile,name='extractFile'),
]
