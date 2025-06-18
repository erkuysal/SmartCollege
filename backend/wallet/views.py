from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Wallet, Transaction, ActivityType, MultiplierRule
from .serializers import WalletSerializer, TransactionSerializer, ActivityTypeSerializer, MultiplierRuleSerializer

# Create your views here.

class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [AllowAny]

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [AllowAny]

class ActivityTypeViewSet(viewsets.ModelViewSet):
    queryset = ActivityType.objects.all()
    serializer_class = ActivityTypeSerializer
    permission_classes = [AllowAny]

class MultiplierRuleViewSet(viewsets.ModelViewSet):
    queryset = MultiplierRule.objects.all()
    serializer_class = MultiplierRuleSerializer
    permission_classes = [AllowAny]
