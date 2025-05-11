from django.urls import path, include
from rest_framework.routers import DefaultRouter


router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # path('latestCaseReport',latest_casereport,name='latest-casereport')
]
