from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import addIncome,viewAllIncome,deleteIncome,editIncome,extractFile

router = DefaultRouter()

urlpatterns = [
    path('api', include(router.urls)),
    path('api/income/addIncome',addIncome,name='addIncome'),
    path('api/income/viewAllIncome',viewAllIncome,name='viewAllIncome'),
    path('api/income/deleteIncome',deleteIncome,name='deleteIncome'),
    path('api/income/editIncome',editIncome,name='editIncome'),
    path('api/income/extractFile',extractFile,name='extractFile'),
]
