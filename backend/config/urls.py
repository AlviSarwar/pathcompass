from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('academics.urls')),
    path('api/', include('careers.urls')),
    path('api/', include('abroad.urls')),
    path('api/', include('planning.urls')),
]



